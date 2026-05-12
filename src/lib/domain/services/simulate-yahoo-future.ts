/**
 * Projects a product forward in time at a given annual rate by compounding
 * its latest EUR value. Used for both Yahoo (5y geomean) and custom
 * (yield+FX-geomean compound) products — the projection mechanics are the
 * same once both rates are expressed in EUR.
 *
 * @module domain/services/simulate-yahoo-future
 */

export interface SimulationPoint {
  /** ISO yyyy-mm-dd */
  date: string;
  /** EUR-anchored projection */
  value: number;
}

export interface HistorySample {
  /** ISO yyyy-mm-dd */
  date: string;
  /** Value in EUR */
  value: number;
}

/**
 * Builds a forward projection sampled monthly (one point per ~30 days),
 * compounding `lastValue` at `annualReturn`. Returns an empty array when
 * the input is too thin to project (no value, no rate, zero horizon).
 *
 * @param lastValue - Anchor EUR value at `startDate`
 * @param annualReturn - Annual return as decimal (0.07 = 7%); `null` skips
 * @param horizonYears - Number of years to project forward
 * @param startDate - Anchor "today"; included as the first point
 * @returns Sequence of points starting at `startDate`
 */
export function simulateYahooFuture(
  lastValue: number,
  annualReturn: number | null,
  horizonYears: number,
  startDate: Date = new Date(),
): SimulationPoint[] {
  if (horizonYears <= 0 || lastValue <= 0 || annualReturn == null) return [];
  const dailyReturn = Math.pow(1 + annualReturn, 1 / 365) - 1;

  const points: SimulationPoint[] = [];
  const stepDays = 30;
  const horizonDays = Math.round(horizonYears * 365);
  for (let day = 0; day <= horizonDays; day += stepDays) {
    const t = new Date(startDate);
    t.setDate(t.getDate() + day);
    points.push({
      date: t.toISOString().slice(0, 10),
      value: lastValue * Math.pow(1 + dailyReturn, day),
    });
  }
  return points;
}
