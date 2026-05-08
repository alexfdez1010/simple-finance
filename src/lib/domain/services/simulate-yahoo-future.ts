/**
 * Projects a Yahoo product forward in time using the daily geometric-mean
 * return implied by its EUR snapshot history.
 *
 * The geometric mean is taken on the full span: r_d = (V_n / V_0)^(1/days) - 1
 * where `V_0` and `V_n` are the first and last snapshot values and `days` is
 * the calendar gap between them. The same daily compounding then runs forward
 * from the last point. This is an indicative "what if the past pace held"
 * line — not a forecast — and matches how the custom-product simulation
 * compounds at a fixed daily rate.
 *
 * @module domain/services/simulate-yahoo-future
 */

import { differenceInDays } from 'date-fns';
import type { SimulationPoint } from './simulate-custom-future';

export interface HistorySample {
  /** ISO yyyy-mm-dd */
  date: string;
  /** Value in EUR */
  value: number;
}

/**
 * Builds a forward projection sampled monthly (one point per ~30 days).
 *
 * Returns an empty array when the input is too thin or degenerate to derive
 * a daily growth rate (fewer than two points, zero span, non-positive
 * endpoints).
 *
 * @param history - Per-day EUR series, ascending by date
 * @param horizonYears - Number of years to project forward
 * @param startDate - Anchor "today"; included as the first point
 * @returns Sequence of points starting at `startDate`
 */
export function simulateYahooFuture(
  history: HistorySample[],
  horizonYears: number,
  startDate: Date = new Date(),
): SimulationPoint[] {
  if (horizonYears <= 0 || history.length < 2) return [];
  const first = history[0];
  const last = history[history.length - 1];
  const totalDays = differenceInDays(new Date(last.date), new Date(first.date));
  if (totalDays <= 0 || first.value <= 0 || last.value <= 0) return [];
  const dailyGeomReturn = Math.pow(last.value / first.value, 1 / totalDays) - 1;

  const points: SimulationPoint[] = [];
  const stepDays = 30;
  const horizonDays = Math.round(horizonYears * 365);
  for (let day = 0; day <= horizonDays; day += stepDays) {
    const t = new Date(startDate);
    t.setDate(t.getDate() + day);
    points.push({
      date: t.toISOString().slice(0, 10),
      value: last.value * Math.pow(1 + dailyGeomReturn, day),
    });
  }
  return points;
}
