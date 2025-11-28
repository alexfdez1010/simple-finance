/**
 * Service for calculating custom product values based on annual return rate
 * All values are in EUR
 * @module domain/services/custom-product-calculator
 */

import { differenceInDays } from 'date-fns';

/**
 * Calculates the current value of a custom product based on annual return rate
 * Uses compound interest formula: A = P(1 + r/365)^(days)
 * Initial investment is already in EUR (converted at creation time)
 * Returns current value in EUR
 *
 * @param initialInvestmentEur - Initial investment amount in EUR
 * @param annualReturnRate - Annual return rate as decimal (e.g., 0.05 for 5%)
 * @param investmentDate - Date of initial investment
 * @param currentDate - Current date for calculation (defaults to today)
 * @returns Current value of the investment in EUR
 */
export async function calculateCustomProductValue(
  initialInvestmentEur: number,
  annualReturnRate: number,
  investmentDate: Date,
  currentDate: Date = new Date(),
): Promise<number> {
  if (initialInvestmentEur <= 0) {
    throw new Error('Initial investment must be positive');
  }

  if (annualReturnRate < -1) {
    throw new Error('Annual return rate cannot be less than -100%');
  }

  const daysSinceInvestment = differenceInDays(currentDate, investmentDate);

  if (daysSinceInvestment < 0) {
    throw new Error('Investment date cannot be in the future');
  }

  // Compound interest formula (already in EUR)
  const dailyRate = annualReturnRate / 365;
  const currentValueEur =
    initialInvestmentEur * Math.pow(1 + dailyRate, daysSinceInvestment);

  return Math.round(currentValueEur * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculates the current value of a custom product (synchronous version)
 * Used when EUR conversion is already done
 * Uses compound interest formula: A = P(1 + r/365)^(days)
 *
 * @param initialInvestmentEur - Initial investment amount in EUR (already converted)
 * @param annualReturnRate - Annual return rate as decimal (e.g., 0.05 for 5%)
 * @param investmentDate - Date of initial investment
 * @param currentDate - Current date for calculation (defaults to today)
 * @returns Current value of the investment in EUR
 */
export function calculateCustomProductValueSync(
  initialInvestmentEur: number,
  annualReturnRate: number,
  investmentDate: Date,
  currentDate: Date = new Date(),
): number {
  if (initialInvestmentEur <= 0) {
    throw new Error('Initial investment must be positive');
  }

  if (annualReturnRate < -1) {
    throw new Error('Annual return rate cannot be less than -100%');
  }

  const daysSinceInvestment = differenceInDays(currentDate, investmentDate);

  if (daysSinceInvestment < 0) {
    throw new Error('Investment date cannot be in the future');
  }

  // Daily compound interest formula
  const dailyRate = annualReturnRate / 365;
  const currentValue =
    initialInvestmentEur * Math.pow(1 + dailyRate, daysSinceInvestment);

  return Math.round(currentValue * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculates the total return amount
 *
 * @param currentValue - Current value of the investment
 * @param initialInvestment - Initial investment amount
 * @returns Total return amount
 */
export function calculateReturn(
  currentValue: number,
  initialInvestment: number,
): number {
  return Math.round((currentValue - initialInvestment) * 100) / 100;
}

/**
 * Calculates the return percentage
 *
 * @param currentValue - Current value of the investment
 * @param initialInvestment - Initial investment amount
 * @returns Return percentage
 */
export function calculateReturnPercentage(
  currentValue: number,
  initialInvestment: number,
): number {
  if (initialInvestment === 0) {
    return 0;
  }

  const returnPercentage =
    ((currentValue - initialInvestment) / initialInvestment) * 100;
  return Math.round(returnPercentage * 100) / 100;
}

/**
 * Calculates daily change in value
 *
 * @param currentValue - Current value
 * @param previousValue - Previous day value
 * @returns Daily change amount
 */
export function calculateDailyChange(
  currentValue: number,
  previousValue: number,
): number {
  return Math.round((currentValue - previousValue) * 100) / 100;
}

/**
 * Calculates daily change percentage
 *
 * @param currentValue - Current value
 * @param previousValue - Previous day value
 * @returns Daily change percentage
 */
export function calculateDailyChangePercentage(
  currentValue: number,
  previousValue: number,
): number {
  if (previousValue === 0) {
    return 0;
  }

  const changePercentage =
    ((currentValue - previousValue) / previousValue) * 100;
  return Math.round(changePercentage * 100) / 100;
}
