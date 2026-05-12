/**
 * Server-side fetcher for the geometric-mean annual appreciation of a foreign
 * currency / crypto / commodity against the Euro over the last five years.
 *
 * Pulls 5 years of monthly closes via yahoo-finance2 and reduces them to a
 * single CAGR using `computeAnnualGeomReturn`. The result is cached for one
 * day per currency via `unstable_cache` so cards and projections do not
 * re-issue the chart request on every render.
 *
 * Tickers used:
 *  - USD  → `USDEUR=X`  (1 USD quoted in EUR)
 *  - BTC  → `BTC-EUR`
 *  - ETH  → `ETH-EUR`
 *  - XAUT → composed: `XAUT-USD` × `USDEUR=X` (no native EUR pair exists)
 *
 * @module infrastructure/currency/currency-history-client
 */

import { unstable_cache } from 'next/cache';
import YahooFinance from 'yahoo-finance2';
import {
  computeAnnualGeomReturn,
  samplesFromChartQuotes,
} from '@/lib/domain/services/yahoo-expected-return';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const ONE_DAY_SECONDS = 24 * 60 * 60;

const CURRENCY_TICKERS: Record<string, string> = {
  USD: 'USDEUR=X',
  BTC: 'BTC-EUR',
  ETH: 'ETH-EUR',
};

const fetchGeomeanForTicker = unstable_cache(
  async (ticker: string): Promise<number | null> => {
    try {
      const end = new Date();
      const start = new Date();
      start.setFullYear(end.getFullYear() - 5);
      const result = await yahooFinance.chart(ticker, {
        period1: start,
        period2: end,
        interval: '1mo',
      });
      const samples = samplesFromChartQuotes(result?.quotes ?? []);
      return computeAnnualGeomReturn(samples);
    } catch (err) {
      console.error(`Currency history fetch failed for ${ticker}:`, err);
      return null;
    }
  },
  ['currency-history-5y'],
  { revalidate: ONE_DAY_SECONDS },
);

/**
 * Annualised geometric-mean appreciation of `currency` against EUR over the
 * last five years, as a decimal (0.03 = +3%/yr). Returns 0 for EUR, `null`
 * when the currency is unknown or Yahoo has no data.
 *
 * @param currency - 'EUR' | 'USD' | 'BTC' | 'ETH' | 'XAUT'
 */
export async function getCurrencyExpectedReturnVsEur(
  currency: string | null | undefined,
): Promise<number | null> {
  const code = (currency ?? 'EUR').toUpperCase();
  if (code === 'EUR') return 0;
  if (code === 'XAUT') {
    const [xaut, usd] = await Promise.all([
      fetchGeomeanForTicker('XAUT-USD'),
      fetchGeomeanForTicker('USDEUR=X'),
    ]);
    if (xaut == null || usd == null) return null;
    return (1 + xaut) * (1 + usd) - 1;
  }
  const ticker = CURRENCY_TICKERS[code];
  if (!ticker) return null;
  return fetchGeomeanForTicker(ticker);
}
