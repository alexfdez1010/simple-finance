/**
 * Service for calculating projected profit rates from custom (fixed-rate)
 * products. Variable-income products are excluded because their daily
 * return cannot be predicted.
 *
 * Daily profit per product is computed as `investedEur · annualRate / 365`
 * where `investedEur` is the net invested amount in EUR (sum of every
 * contribution converted at the time the product was enriched). The
 * percentage for each period is the period's projected profit divided by
 * the aggregated custom-product invested base — i.e. the weighted average
 * fixed rate of all custom products, scaled to the period.
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

/**
 * Aggregates projected profit rates over the custom products of a portfolio.
 *
 * @param products - Products already enriched with `investedEur`
 * @returns Daily / weekly / monthly / annual EUR projections plus matching %
 */
export function calculateProfitRatesSync(
  products: ProductWithValue[],
): ProfitRates {
  let totalDailyProfit = 0;
  let totalCustomInvested = 0;

  for (const product of products) {
    if (product.type !== 'CUSTOM') continue;
    if (product.investedEur <= 0) continue;
    const dailyRate = product.custom.annualReturnRate / 365;
    totalDailyProfit += product.investedEur * dailyRate;
    totalCustomInvested += product.investedEur;
  }

  const round = (n: number) => Math.round(n * 100) / 100;
  const pct = (value: number) =>
    totalCustomInvested > 0 ? round((value / totalCustomInvested) * 100) : 0;

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
