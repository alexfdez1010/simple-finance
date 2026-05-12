/**
 * Pure helpers for the Yahoo expected-return calculation. Kept free of any
 * server-only imports (yahoo-finance2, next/cache) so unit tests can exercise
 * the maths directly; the live fetch + caching wrapper lives in
 * `infrastructure/yahoo-finance/expected-return-client`.
 *
 * @module domain/services/yahoo-expected-return
 */

import { differenceInDays } from 'date-fns';

export interface ReturnSample {
  date: Date;
  /** Close (adjusted for splits/dividends when available). */
  value: number;
}

/**
 * Annualised geometric mean return from a series of dated prices.
 *
 * Formula: (V_n / V_0) ^ (365 / days) − 1, using the first and last positive
 * samples. Returns `null` for inputs too sparse or degenerate to interpret
 * (fewer than two positives, zero span). Callers decide how to render
 * "unknown" — we do not invent a fallback rate.
 *
 * @param samples - Time-ordered samples; non-positive values are skipped
 * @returns CAGR as decimal, or null when undefined
 */
export function computeAnnualGeomReturn(
  samples: ReturnSample[],
): number | null {
  const positives = samples.filter(
    (s) => Number.isFinite(s.value) && s.value > 0,
  );
  if (positives.length < 2) return null;
  const first = positives[0];
  const last = positives[positives.length - 1];
  const days = differenceInDays(last.date, first.date);
  if (days <= 0) return null;
  return Math.pow(last.value / first.value, 365 / days) - 1;
}

interface ChartLikeQuote {
  date: Date;
  close: number | null;
  adjclose?: number | null;
}

/**
 * Adapts a yahoo-finance2 chart result into the samples this service expects.
 * Prefers `adjclose` (handles splits/dividends) and falls back to `close`.
 */
export function samplesFromChartQuotes(
  quotes: ChartLikeQuote[],
): ReturnSample[] {
  return quotes
    .map((q) => ({
      date: q.date,
      value: (q.adjclose ?? q.close ?? 0) as number,
    }))
    .filter((s) => s.value > 0);
}
