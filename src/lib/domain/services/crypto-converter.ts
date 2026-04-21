/**
 * Server-only crypto/commodity → EUR conversion.
 * Kept separate from currency-converter.ts so the yahoo-finance2 import
 * (Node-only, uses @deno/shim-deno) never gets pulled into a client bundle
 * through transitive imports (profit-rate-calculator is used by client code).
 * @module domain/services/crypto-converter
 */

import { unstable_cache } from 'next/cache';
import {
  getCryptoYahooTicker,
  convertCryptoToEur,
  type CryptoCurrency,
} from '@/lib/infrastructure/currency/exchange-rate-client';
import { fetchYahooQuoteServer } from '@/lib/infrastructure/yahoo-finance/server-client';

const FALLBACK_CRYPTO_TO_EUR_RATES: Record<CryptoCurrency, number> = {
  BTC: 90000,
  ETH: 3000,
  XAUT: 3000,
};

/**
 * Cached per-asset EUR spot rate. One Yahoo call per asset / hour,
 * reused everywhere (same strategy as the USD→EUR fetch cache).
 */
const getCryptoRateEur = unstable_cache(
  async (symbol: CryptoCurrency): Promise<number | null> => {
    const quote = await fetchYahooQuoteServer(getCryptoYahooTicker(symbol));
    return quote?.regularMarketPrice ?? null;
  },
  ['crypto-eur-rate'],
  { revalidate: 3600 },
);

/**
 * Converts an amount in BTC/ETH/XAUT to EUR using the cached Yahoo rate.
 *
 * @param amount - Amount in source asset
 * @param symbol - Asset symbol
 * @returns Amount in EUR
 */
export async function convertCryptoAssetToEur(
  amount: number,
  symbol: CryptoCurrency,
): Promise<number> {
  const cachedRate = await getCryptoRateEur(symbol);
  const rate = cachedRate ?? FALLBACK_CRYPTO_TO_EUR_RATES[symbol];
  return convertCryptoToEur(amount, rate);
}
