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

/**
 * Cached per-asset EUR spot rate. One Yahoo call per asset / minute,
 * reused everywhere.
 */
const getCryptoRateEur = unstable_cache(
  async (symbol: CryptoCurrency): Promise<number | null> => {
    const quote = await fetchYahooQuoteServer(getCryptoYahooTicker(symbol));
    return quote?.regularMarketPrice ?? null;
  },
  ['crypto-eur-rate'],
  { revalidate: 60 },
);

/**
 * Converts an amount in BTC/ETH/XAUT to EUR using the cached Yahoo rate.
 * Throws if the rate is unavailable — better to surface the failure than
 * silently render a stale or made-up value.
 *
 * @param amount - Amount in source asset
 * @param symbol - Asset symbol
 * @returns Amount in EUR
 */
export async function convertCryptoAssetToEur(
  amount: number,
  symbol: CryptoCurrency,
): Promise<number> {
  const rate = await getCryptoRateEur(symbol);
  if (!rate) throw new Error(`Missing ${symbol}→EUR rate`);
  return convertCryptoToEur(amount, rate);
}
