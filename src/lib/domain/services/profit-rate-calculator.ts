/**
 * Service for calculating projected profit rates from custom (fixed-rate)
 * products. Variable-income products are excluded because their daily
 * return cannot be predicted.
 *
 * Daily profit per product is computed as `investedEur · annualRate / 365`
 * where `investedEur` is the net invested amount in EUR (sum of every
 * contribution converted at the time the product was enriched).
 *
 * @module domain/services/profit-rate-calculator
 */

import type { ProductWithValue } from '@/lib/domain/models/product.types';

export interface ProfitRates {
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
}

/**
 * Aggregates projected profit rates over the custom products of a portfolio.
 *
 * @param products - Products already enriched with `investedEur`
 * @returns Daily / weekly / monthly / annual EUR projections
 */
export function calculateProfitRatesSync(
  products: ProductWithValue[],
): ProfitRates {
  let totalDailyProfit = 0;

  for (const product of products) {
    if (product.type !== 'CUSTOM') continue;
    if (product.investedEur <= 0) continue;
    const dailyRate = product.custom.annualReturnRate / 365;
    totalDailyProfit += product.investedEur * dailyRate;
  }

  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    daily: round(totalDailyProfit),
    weekly: round(totalDailyProfit * 7),
    monthly: round(totalDailyProfit * 30),
    annual: round(totalDailyProfit * 365),
  };
}
