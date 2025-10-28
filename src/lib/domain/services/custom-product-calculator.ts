/**
 * Service for calculating custom product values based on annual return rate
 * @module domain/services/custom-product-calculator
 */

import { differenceInDays } from 'date-fns';

/**
 * Calculates the current value of a custom product based on annual return rate
 * Uses compound interest formula: A = P(1 + r/365)^(days)
 *
 * @param initialInvestment - Initial investment amount
 * @param annualReturnRate - Annual return rate as decimal (e.g., 0.05 for 5%)
 * @param investmentDate - Date of initial investment
 * @param currentDate - Current date for calculation (defaults to today)
 * @returns Current value of the investment
 */
export function calculateCustomProductValue(
  initialInvestment: number,
  annualReturnRate: number,
  investmentDate: Date,
  currentDate: Date = new Date(),
): number {
  if (initialInvestment <= 0) {
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
    initialInvestment * Math.pow(1 + dailyRate, daysSinceInvestment);

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
