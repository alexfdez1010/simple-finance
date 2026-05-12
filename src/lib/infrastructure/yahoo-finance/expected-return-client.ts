/**
 * Server-side fetcher for a Yahoo product's annual expected return.
 *
 * Pulls 5 years of monthly closes via yahoo-finance2 and reduces them to a
 * single CAGR using `computeAnnualGeomReturn`. The result is cached for one
 * day per symbol via `unstable_cache` so cards/profit-rate projections do
 * not re-issue the chart request on every render.
 *
 * @module infrastructure/yahoo-finance/expected-return-client
 */

import { unstable_cache } from 'next/cache';
import YahooFinance from 'yahoo-finance2';
import {
  computeAnnualGeomReturn,
  samplesFromChartQuotes,
} from '@/lib/domain/services/yahoo-expected-return';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const ONE_DAY_SECONDS = 24 * 60 * 60;

const fetchExpectedReturn = unstable_cache(
  async (symbol: string): Promise<number | null> => {
    try {
      const end = new Date();
      const start = new Date();
      start.setFullYear(end.getFullYear() - 5);
      const result = await yahooFinance.chart(symbol, {
        period1: start,
        period2: end,
        interval: '1mo',
      });
      const samples = samplesFromChartQuotes(result?.quotes ?? []);
      return computeAnnualGeomReturn(samples);
    } catch (err) {
      console.error(`Expected-return fetch failed for ${symbol}:`, err);
      return null;
    }
  },
  ['yahoo-expected-return-5y'],
  { revalidate: ONE_DAY_SECONDS },
);

/**
 * Geometric-mean annual return implied by the last five years of monthly
 * closes for `symbol`. Cached one day per symbol. Returns `null` when Yahoo
 * refuses the symbol or the series is too thin.
 *
 * @param symbol - Yahoo Finance ticker
 */
export async function getYahooExpectedReturn(
  symbol: string,
): Promise<number | null> {
  if (!symbol || symbol.trim().length === 0) return null;
  return fetchExpectedReturn(symbol);
}
