/**
 * Service for calculating portfolio statistics and aggregations
 * @module domain/services/portfolio-statistics
 */

import type {
  FinancialProduct,
  PortfolioStatistics,
  DailyPortfolioValue,
  ProductSnapshot,
} from '@/lib/domain/models/product.types';
import { calculateCustomProductValue } from './custom-product-calculator';
import { startOfDay, subDays } from 'date-fns';

/**
 * Product value with metadata
 */
interface ProductValue {
  productId: string;
  name: string;
  currentValue: number;
  initialInvestment: number;
}

/**
 * Calculates current value for a single product
 *
 * @param product - Financial product
 * @param currentPrice - Current price for Yahoo Finance products
 * @returns Product value information
 */
export function calculateProductValue(
  product: FinancialProduct,
  currentPrice?: number,
): ProductValue {
  if (product.type === 'YAHOO_FINANCE') {
    if (!currentPrice) {
      throw new Error('Current price required for Yahoo Finance products');
    }

    return {
      productId: product.id,
      name: product.name,
      currentValue: currentPrice * product.quantity,
      initialInvestment: 0, // We don't track initial investment for Yahoo products
    };
  }

  // Custom product
  const currentValue = calculateCustomProductValue(
    product.custom.initialInvestment,
    product.custom.annualReturnRate,
    product.custom.investmentDate,
  );

  return {
    productId: product.id,
    name: product.name,
    currentValue: currentValue * product.quantity,
    initialInvestment: product.custom.initialInvestment * product.quantity,
  };
}

/**
 * Calculates portfolio statistics
 *
 * @param products - Array of financial products
 * @param currentPrices - Map of product ID to current price for Yahoo products
 * @param previousDayValues - Map of product ID to previous day value
 * @returns Portfolio statistics
 */
export function calculatePortfolioStatistics(
  products: FinancialProduct[],
  currentPrices: Map<string, number>,
  previousDayValues?: Map<string, number>,
): PortfolioStatistics {
  let totalValue = 0;
  let totalInvestment = 0;
  let previousTotalValue = 0;

  for (const product of products) {
    const price =
      product.type === 'YAHOO_FINANCE'
        ? currentPrices.get(product.id)
        : undefined;
    const productValue = calculateProductValue(product, price);

    totalValue += productValue.currentValue;
    totalInvestment += productValue.initialInvestment;

    if (previousDayValues) {
      const prevValue = previousDayValues.get(product.id) || 0;
      previousTotalValue += prevValue;
    }
  }

  const totalReturn = totalValue - totalInvestment;
  const totalReturnPercentage =
    totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

  const dailyChange = previousDayValues ? totalValue - previousTotalValue : 0;
  const dailyChangePercentage =
    previousDayValues && previousTotalValue > 0
      ? (dailyChange / previousTotalValue) * 100
      : 0;

  return {
    totalValue: Math.round(totalValue * 100) / 100,
    totalInvestment: Math.round(totalInvestment * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    totalReturnPercentage: Math.round(totalReturnPercentage * 100) / 100,
    dailyChange: Math.round(dailyChange * 100) / 100,
    dailyChangePercentage: Math.round(dailyChangePercentage * 100) / 100,
    productCount: products.length,
  };
}

/**
 * Calculates daily portfolio values from snapshots
 *
 * @param products - Array of financial products
 * @param snapshots - Map of product ID to array of snapshots
 * @param days - Number of days to include
 * @returns Array of daily portfolio values
 */
export function calculateDailyPortfolioValues(
  products: FinancialProduct[],
  snapshots: Map<string, ProductSnapshot[]>,
  days: number = 30,
): DailyPortfolioValue[] {
  const dailyValues: DailyPortfolioValue[] = [];
  const today = startOfDay(new Date());

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    let totalValue = 0;
    const productValues: DailyPortfolioValue['products'] = [];

    for (const product of products) {
      const productSnapshots = snapshots.get(product.id) || [];
      const snapshot = productSnapshots.find(
        (s) => startOfDay(s.date).getTime() === date.getTime(),
      );

      if (snapshot) {
        totalValue += snapshot.value * snapshot.quantity;
        productValues.push({
          productId: product.id,
          name: product.name,
          value: snapshot.value * snapshot.quantity,
        });
      }
    }

    if (productValues.length > 0) {
      dailyValues.push({
        date,
        value: Math.round(totalValue * 100) / 100,
        products: productValues,
      });
    }
  }

  return dailyValues;
}

/**
 * Calculates the total portfolio value at a specific date
 *
 * @param products - Array of financial products
 * @param snapshots - Map of product ID to array of snapshots
 * @param date - Target date
 * @returns Total portfolio value
 */
export function calculatePortfolioValueAtDate(
  products: FinancialProduct[],
  snapshots: Map<string, ProductSnapshot[]>,
  date: Date,
): number {
  let totalValue = 0;
  const targetDate = startOfDay(date);

  for (const product of products) {
    const productSnapshots = snapshots.get(product.id) || [];
    const snapshot = productSnapshots.find(
      (s) => startOfDay(s.date).getTime() === targetDate.getTime(),
    );

    if (snapshot) {
      totalValue += snapshot.value * snapshot.quantity;
    }
  }

  return Math.round(totalValue * 100) / 100;
}
