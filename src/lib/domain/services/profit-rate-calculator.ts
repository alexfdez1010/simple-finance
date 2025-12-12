/**
 * Service for calculating profit rates from custom products
 * Only considers custom products as variable income products cannot be predicted
 * @module domain/services/profit-rate-calculator
 */

import type { FinancialProduct } from '@/lib/domain/models/product.types';
import { convertToEur } from '@/lib/domain/services/currency-converter';

/**
 * Profit rate calculation result
 */
export interface ProfitRates {
  /** Daily profit in EUR */
  daily: number;
  /** Weekly profit in EUR */
  weekly: number;
  /** Monthly profit in EUR (30 days) */
  monthly: number;
}

/**
 * Calculates the daily profit rate for a single custom product
 * Uses compound interest: daily profit = P * ((1 + r/365) - 1)
 *
 * @param initialInvestmentEur - Initial investment in EUR
 * @param annualReturnRate - Annual return rate as decimal (e.g., 0.05 for 5%)
 * @param quantity - Product quantity
 * @returns Daily profit in EUR
 */
function calculateDailyProfit(
  initialInvestmentEur: number,
  annualReturnRate: number,
  quantity: number,
): number {
  const totalInvestment = initialInvestmentEur * quantity;
  const dailyRate = annualReturnRate / 365;
  const dailyProfit = totalInvestment * dailyRate;
  return dailyProfit;
}

/**
 * Calculates profit rates for all custom products
 * Only includes custom products (fixed income) as variable income cannot be predicted
 *
 * @param products - Array of financial products with current values
 * @returns Profit rates (daily, weekly, monthly) in EUR
 */
export async function calculateProfitRates(
  products: Array<FinancialProduct & { currentValue: number }>,
): Promise<ProfitRates> {
  const customProducts = products.filter((p) => p.type === 'CUSTOM');

  if (customProducts.length === 0) {
    return { daily: 0, weekly: 0, monthly: 0 };
  }

  let totalDailyProfit = 0;

  for (const product of customProducts) {
    if (!product.custom) continue;

    let investmentEur = product.custom.initialInvestment;

    // Convert USD to EUR if needed
    if (product.custom.currency === 'USD') {
      investmentEur = await convertToEur(product.custom.initialInvestment);
    }

    const dailyProfit = calculateDailyProfit(
      investmentEur,
      product.custom.annualReturnRate,
      product.quantity,
    );

    totalDailyProfit += dailyProfit;
  }

  // Round to 2 decimal places
  const daily = Math.round(totalDailyProfit * 100) / 100;
  const weekly = Math.round(totalDailyProfit * 7 * 100) / 100;
  const monthly = Math.round(totalDailyProfit * 30 * 100) / 100;

  return { daily, weekly, monthly };
}

/**
 * Calculates profit rates synchronously (when all values are already in EUR)
 *
 * @param products - Array of financial products with current values
 * @returns Profit rates (daily, weekly, monthly) in EUR
 */
export function calculateProfitRatesSync(
  products: Array<FinancialProduct & { currentValue: number }>,
): ProfitRates {
  const customProducts = products.filter((p) => p.type === 'CUSTOM');

  if (customProducts.length === 0) {
    return { daily: 0, weekly: 0, monthly: 0 };
  }

  let totalDailyProfit = 0;

  for (const product of customProducts) {
    if (!product.custom) continue;

    // Assume already in EUR for sync version
    const dailyProfit = calculateDailyProfit(
      product.custom.initialInvestment,
      product.custom.annualReturnRate,
      product.quantity,
    );

    totalDailyProfit += dailyProfit;
  }

  const daily = Math.round(totalDailyProfit * 100) / 100;
  const weekly = Math.round(totalDailyProfit * 7 * 100) / 100;
  const monthly = Math.round(totalDailyProfit * 30 * 100) / 100;

  return { daily, weekly, monthly };
}
