/**
 * Server-side fetcher for EUR → display-currency rates.
 * Strategy: pivot through USD. All Yahoo crypto/commodity tickers are quoted
 * in USD (BTC-USD, ETH-USD, XAUT-USD); the USD→EUR rate comes from the
 * existing cached fetch. From those raw USD prices every EUR→X multiplier
 * falls out of a single division, and each asset is hit only once per hour.
 * @module domain/services/display-rates
 */

import { unstable_cache } from 'next/cache';
import {
  fetchUsdToEurRate,
  getCryptoYahooTicker,
  type CryptoCurrency,
} from '@/lib/infrastructure/currency/exchange-rate-client';
import { fetchYahooQuoteServer } from '@/lib/infrastructure/yahoo-finance/server-client';
import type { DisplayCurrency } from '@/lib/utils/format-currency';

const getUsdPriceOfCrypto = unstable_cache(
  async (symbol: CryptoCurrency): Promise<number | null> => {
    const quote = await fetchYahooQuoteServer(getCryptoYahooTicker(symbol));
    return quote?.regularMarketPriceUsd ?? null;
  },
  ['display-crypto-usd-price'],
  { revalidate: 60 },
);

/**
 * Returns EUR → target multipliers for every supported display currency.
 * One cached Yahoo/FX call per asset / hour; reused everywhere.
 * Throws if any upstream lookup fails — no silent fallback.
 *
 * @returns Record mapping currency to multiplier (EUR × rate = target units)
 */
export async function getDisplayRates(): Promise<
  Record<DisplayCurrency, number>
> {
  const [usdToEur, btcUsd, ethUsd, xautUsd] = await Promise.all([
    fetchUsdToEurRate(),
    getUsdPriceOfCrypto('BTC'),
    getUsdPriceOfCrypto('ETH'),
    getUsdPriceOfCrypto('XAUT'),
  ]);

  if (!usdToEur?.rate) throw new Error('Missing USD→EUR rate');
  if (!btcUsd) throw new Error('Missing BTC-USD price');
  if (!ethUsd) throw new Error('Missing ETH-USD price');
  if (!xautUsd) throw new Error('Missing XAUT-USD price');

  // 1 USD = usdInEur EUR  →  1 EUR = eurInUsd USD
  const eurInUsd = 1 / usdToEur.rate;

  return {
    EUR: 1,
    USD: eurInUsd,
    BTC: eurInUsd / btcUsd,
    ETH: eurInUsd / ethUsd,
    XAUT: eurInUsd / xautUsd,
  };
}
