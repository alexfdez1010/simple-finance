/**
 * Service for projecting portfolio profit over short horizons.
 *
 * Each product contributes `currentValueEur · expectedAnnualReturn / 365`:
 *  - Yahoo products: `expectedAnnualReturn` is the geometric mean of the last
 *    five years of monthly closes.
 *  - Custom products: `expectedAnnualReturn` compounds the contractual yield
 *    with the 5-year geometric-mean appreciation of the product's currency
 *    against EUR (see `custom-expected-return`).
 *
 * A product with no usable expected return (e.g. Yahoo lookup failed, sparse
 * history) is skipped — we do not invent a fallback rate.
 *
 * Daily / weekly / monthly / annual EUR projections sum every product's
 * contribution. Percentages are reported against the same base the daily
 * profit was computed from, so they describe the weighted-average rate of
 * the productive portion of the portfolio.
 *
 * @module domain/services/profit-rate-calculator
 */

import type { ProductWithValue } from '@/lib/domain/models/product.types';

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

function dailyProfitFor(product: ProductWithValue): {
  profit: number;
  base: number;
} {
  const rate = product.expectedAnnualReturn;
  if (rate == null || product.currentValueEur <= 0) {
    return { profit: 0, base: 0 };
  }
  return {
    profit: (product.currentValueEur * rate) / 365,
    base: product.currentValueEur,
  };
}

/**
 * Aggregates projected profit rates across the portfolio.
 *
 * Every product feeds in via its `expectedAnnualReturn`: Yahoo's 5y geomean
 * for stocks, the yield+FX-geomean compound for custom products.
 *
 * @param products - Products already enriched with `expectedAnnualReturn`
 * @returns Daily / weekly / monthly / annual EUR projections plus matching %
 */
export function calculateProfitRatesSync(
  products: ProductWithValue[],
): ProfitRates {
  let totalDailyProfit = 0;
  let totalBase = 0;

  for (const product of products) {
    const { profit, base } = dailyProfitFor(product);
    totalDailyProfit += profit;
    totalBase += base;
  }

  const round = (n: number) => Math.round(n * 100) / 100;
  const pct = (value: number) =>
    totalBase > 0 ? round((value / totalBase) * 100) : 0;

  const daily = round(totalDailyProfit);
  const weekly = round(totalDailyProfit * 7);
  const monthly = round(totalDailyProfit * 30);
  const annual = round(totalDailyProfit * 365);
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
