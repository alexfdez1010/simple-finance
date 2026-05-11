/**
 * Computes the daily geometric-mean return implied by a product's EUR
 * snapshot history. Because snapshots are stored in EUR, the resulting
 * rate captures both the underlying yield and any FX drift between the
 * product's currency and EUR.
 *
 * Formula: r_d = (V_n / V_0)^(1/days) - 1
 *
 * @module domain/services/geometric-mean-return
 */

import { differenceInDays } from 'date-fns';
import type { ProductSnapshotPoint } from '@/lib/infrastructure/database/product-snapshot-repository';

/**
 * Returns the daily geometric-mean return of an EUR snapshot series.
 *
 * Returns `null` when the series is too thin or degenerate to derive a
 * meaningful rate (fewer than two points, zero span, non-positive
 * endpoints). Callers should fall back to a static rate when this is the
 * case (e.g. the custom product's contracted annual rate).
 *
 * @param snapshots - Ascending-by-date EUR series for one product
 * @returns Daily compounding rate or `null`
 */
export function dailyGeometricReturn(
  snapshots: ProductSnapshotPoint[],
): number | null {
  if (snapshots.length < 2) return null;
  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const days = differenceInDays(last.date, first.date);
  if (days <= 0 || first.value <= 0 || last.value <= 0) return null;
  return Math.pow(last.value / first.value, 1 / days) - 1;
}

/**
 * Annualized CAGR derived from the daily geometric return.
 *
 * @param dailyRate - Daily compounding rate
 * @returns Annualized rate (e.g. 0.07 for 7%)
 */
export function annualizeDailyRate(dailyRate: number): number {
  return Math.pow(1 + dailyRate, 365) - 1;
}
