/** Pure chart-data builder for product history and projections. */

import { simulateYahooFuture } from '@/lib/domain/services/simulate-yahoo-future';
import type { ProductHistoryResult } from '@/lib/actions/history-actions';
import type { HistoryChartPoint } from '@/components/products/product-history-chart';

export const HORIZON_OPTIONS = [0, 1, 5, 10] as const;
export type HorizonYears = (typeof HORIZON_OPTIONS)[number];

/**
 * Merges actual snapshots with an optional expected-return projection.
 *
 * @param data - Persisted history and the product's expected annual return.
 * @param horizon - Number of years to project; zero returns actual data only.
 * @returns Chart points with a continuous actual-to-projected transition.
 */
export function buildHistoryChartData(
  data: ProductHistoryResult,
  horizon: HorizonYears,
): HistoryChartPoint[] {
  const actual: HistoryChartPoint[] = data.history.map((point) => ({
    date: point.date,
    actual: point.value,
    projected: null,
  }));
  const lastActual = actual[actual.length - 1];
  if (horizon === 0 || !lastActual) return actual;

  const simulation = simulateYahooFuture(
    lastActual.actual ?? 0,
    data.expectedAnnualReturn,
    horizon,
    new Date(lastActual.date),
  );
  if (simulation.length === 0) return actual;

  lastActual.projected = lastActual.actual;
  return [
    ...actual,
    ...simulation.slice(1).map((point) => ({
      date: point.date,
      actual: null,
      projected: point.value,
    })),
  ];
}
