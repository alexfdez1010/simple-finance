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
const HISTORY_LOOKBACK_DAYS = 7;

const CURRENCY_TICKERS: Record<string, string> = {
  USD: 'USDEUR=X',
  BTC: 'BTC-EUR',
  ETH: 'ETH-EUR',
};

/** Returns a stable UTC date key for historical-rate cache arguments. */
function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Builds a Yahoo range ending after the target day and starting seven days
 * earlier so weekends and market holidays have a prior close available.
 */
function historicalWindow(dateKey: string): { start: Date; end: Date } {
  const target = new Date(`${dateKey}T00:00:00.000Z`);
  const start = new Date(target);
  const end = new Date(target);
  start.setUTCDate(start.getUTCDate() - HISTORY_LOOKBACK_DAYS);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

/**
 * Loads the latest positive daily close on or before a target date.
 *
 * @param ticker - Yahoo Finance symbol quoted in the required target currency
 * @param dateKey - UTC date in yyyy-mm-dd format
 * @returns Historical close or null when Yahoo has no usable sample
 */
const fetchHistoricalRateForTicker = unstable_cache(
  async (ticker: string, dateKey: string): Promise<number | null> => {
    try {
      const { start, end } = historicalWindow(dateKey);
      const cutoff = new Date(`${dateKey}T23:59:59.999Z`).getTime();
      const result = await yahooFinance.chart(ticker, {
        period1: start,
        period2: end,
        interval: '1d',
      });
      const samples = samplesFromChartQuotes(result?.quotes ?? [])
        .filter((sample) => sample.date.getTime() <= cutoff)
        .sort((left, right) => left.date.getTime() - right.date.getTime());
      return samples.at(-1)?.value ?? null;
    } catch (error) {
      console.error(`Historical currency rate failed for ${ticker}:`, error);
      return null;
    }
  },
  ['currency-rate-at-date'],
  { revalidate: ONE_DAY_SECONDS },
);

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

/**
 * Returns the EUR value of one unit of a supported currency on a historical
 * date. XAUT is composed from its USD close and that day's USD→EUR close.
 *
 * @param currency - EUR, USD, BTC, ETH, or XAUT
 * @param date - Movement date whose closing rate is required
 * @returns EUR per currency unit, or null for unknown/unavailable history
 */
export async function getHistoricalCurrencyRateToEur(
  currency: string | null | undefined,
  date: Date,
): Promise<number | null> {
  const code = (currency ?? 'EUR').toUpperCase();
  if (code === 'EUR') return 1;

  const dateKey = toDateKey(date);
  if (code === 'XAUT') {
    const [xautUsd, usdEur] = await Promise.all([
      fetchHistoricalRateForTicker('XAUT-USD', dateKey),
      fetchHistoricalRateForTicker('USDEUR=X', dateKey),
    ]);
    if (xautUsd == null || usdEur == null) return null;
    return xautUsd * usdEur;
  }

  const ticker = CURRENCY_TICKERS[code];
  if (!ticker) return null;
  return fetchHistoricalRateForTicker(ticker, dateKey);
}
