/**
 * Service for projecting portfolio profit over short horizons.
 *
 * Each product contributes a daily profit:
 *  - Custom products: `investedEur · annualReturnRate / 365` — the rate is
 *    fixed and applied against the principal invested.
 *  - Yahoo products: `currentValueEur · expectedAnnualReturn / 365` where
 *    `expectedAnnualReturn` is the geometric mean of the last five years of
 *    monthly closes. The rate compounds the asset's market value, so the
 *    appropriate base is the current value, not the original cost basis.
 *
 * A Yahoo product with no usable expected return (e.g. delisted, sparse
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
  if (product.type === 'CUSTOM') {
    if (product.investedEur <= 0) return { profit: 0, base: 0 };
    return {
      profit: (product.investedEur * product.custom.annualReturnRate) / 365,
      base: product.investedEur,
    };
  }
  // YAHOO_FINANCE
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
 * Yahoo products feed in the geometric-mean annual return derived from their
 * 5-year price series; custom products feed in their configured fixed rate.
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
