/**
 * Projects a custom product forward in time using the same compound formula
 * the dashboard already uses for "now" (`calculateCustomProductValueFromContributions`).
 *
 * The simulation runs in the product's native currency and is then anchored
 * to EUR via a single multiplier (today's EUR / today's product-currency
 * value). We do not attempt to forecast FX — projecting at a fixed anchor
 * keeps the curve a faithful illustration of the contract's compounding,
 * not a forecast of currency markets.
 *
 * @module domain/services/simulate-custom-future
 */

import { calculateCustomProductValueFromContributions } from './custom-product-calculator';
import type { CustomContribution } from '@/lib/domain/models/product.types';

export interface SimulationPoint {
  /** ISO yyyy-mm-dd */
  date: string;
  /** EUR-anchored projection */
  value: number;
}

/**
 * Builds a forward projection sampled monthly (one point per ~30 days).
 *
 * @param contributions - All deposits/withdrawals (amounts in product currency)
 * @param annualReturnRate - Annual return rate (decimal; 0.05 = 5%)
 * @param anchorEurPerProductCcy - Multiplier 1 product-ccy → EUR right now
 * @param horizonYears - Number of years to project forward
 * @param startDate - Anchor "today"; included as the first point
 * @returns Sequence of points starting at `startDate`
 */
export function simulateCustomFuture(
  contributions: CustomContribution[],
  annualReturnRate: number,
  anchorEurPerProductCcy: number,
  horizonYears: number,
  startDate: Date = new Date(),
): SimulationPoint[] {
  if (horizonYears <= 0) return [];
  const points: SimulationPoint[] = [];
  const stepDays = 30;
  const totalDays = Math.round(horizonYears * 365);
  for (let day = 0; day <= totalDays; day += stepDays) {
    const t = new Date(startDate);
    t.setDate(t.getDate() + day);
    const valueProductCcy = calculateCustomProductValueFromContributions(
      contributions,
      annualReturnRate,
      t,
    );
    points.push({
      date: t.toISOString().slice(0, 10),
      value: valueProductCcy * anchorEurPerProductCcy,
    });
  }
  return points;
}
