/**
 * Projects portfolio profit over daily / weekly / monthly / annual horizons
 * using each product's own EUR snapshot history. The daily rate is the
 * geometric mean of the EUR series, so it captures both the underlying
 * return (price change or contracted yield) and any FX drift relative to
 * EUR. Per-product daily rates are weighted by current EUR value and
 * compounded forward to derive each horizon.
 *
 * Custom products whose snapshot history is too thin to derive a daily
 * rate fall back to their contracted annual rate (converted to a daily
 * compounding rate). Yahoo products without enough history contribute
 * nothing — there is no sensible static fallback for variable income.
 *
 * @module domain/services/profit-rate-calculator
 */

import type { ProductWithValue } from '@/lib/domain/models/product.types';
import type { ProductSnapshotPoint } from '@/lib/infrastructure/database/product-snapshot-repository';
import { dailyGeometricReturn } from './geometric-mean-return';

export interface ProfitRates {
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
  dailyPct: number;
  weeklyPct: number;
  monthlyPct: number;
  annualPct: number;
}

export type SnapshotsByProduct = Record<string, ProductSnapshotPoint[]>;

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Resolves a product's daily EUR-denominated return rate.
 *
 * Prefers the geometric mean of the snapshot series. Falls back to the
 * contracted annual rate (as a daily compounding rate) for custom
 * products without enough history; returns `null` otherwise.
 *
 * @param product - Enriched product
 * @param snapshots - EUR snapshot series for that product
 * @returns Daily compounding rate or `null`
 */
function resolveDailyRate(
  product: ProductWithValue,
  snapshots: ProductSnapshotPoint[],
): number | null {
  const geom = dailyGeometricReturn(snapshots);
  if (geom !== null) return geom;
  if (product.type === 'CUSTOM') {
    const annual = product.custom.annualReturnRate;
    return Math.pow(1 + annual, 1 / 365) - 1;
  }
  return null;
}

/**
 * Aggregates projected profit across all products of a portfolio.
 *
 * Each product contributes `currentValueEur · ((1 + r_d)^periodDays - 1)`
 * where `r_d` is the snapshot-derived daily geometric return. The
 * percentage for each period is the projected EUR profit divided by the
 * combined current value of the contributing products.
 *
 * @param products - Products already enriched with current EUR values
 * @param snapshotsByProduct - Map of `productId` → ascending EUR series
 * @returns Daily / weekly / monthly / annual EUR projections plus %
 */
export function calculateProfitRatesSync(
  products: ProductWithValue[],
  snapshotsByProduct: SnapshotsByProduct = {},
): ProfitRates {
  const contributing: Array<{ value: number; daily: number }> = [];

  for (const product of products) {
    if (product.currentValueEur <= 0) continue;
    const snapshots = snapshotsByProduct[product.id] ?? [];
    const daily = resolveDailyRate(product, snapshots);
    if (daily === null) continue;
    contributing.push({ value: product.currentValueEur, daily });
  }

  const totalBase = contributing.reduce((s, c) => s + c.value, 0);

  const periodProfit = (days: number) =>
    contributing.reduce(
      (sum, c) => sum + c.value * (Math.pow(1 + c.daily, days) - 1),
      0,
    );

  const daily = round(periodProfit(1));
  const weekly = round(periodProfit(7));
  const monthly = round(periodProfit(30));
  const annual = round(periodProfit(365));

  const pct = (value: number) =>
    totalBase > 0 ? round((value / totalBase) * 100) : 0;

  return {
    daily,
    weekly,
    monthly,
    annual,
    dailyPct: pct(daily),
    weeklyPct: pct(weekly),
    monthlyPct: pct(monthly),
    annualPct: pct(annual),
  };
}
