/**
 * Service for calculating custom product values from contributions and a
 * fixed annual return rate.
 *
 * All values returned by this module are denominated in the product's own
 * currency (the same currency as the input `amount` on contributions).
 * Conversion to a portfolio currency such as EUR is performed by callers
 * via the currency-conversion services.
 *
 * The calculator uses daily compound interest:
 *   value(t) = Σ amount_i · (1 + r/365)^days(t − date_i)
 * where `amount_i` is signed (positive = deposit, negative = withdrawal)
 * and contributions with `date_i > t` are ignored.
 *
 * @module domain/services/custom-product-calculator
 */

import { differenceInDays } from 'date-fns';
import type { CustomContribution } from '@/lib/domain/models/product.types';

/**
 * Validates an annual return rate. Rates below -100% are rejected because
 * compound growth at `(1 + r/365)` would otherwise produce non-real results.
 */
function assertRate(annualReturnRate: number): void {
  if (annualReturnRate < -1) {
    throw new Error('Annual return rate cannot be less than -100%');
  }
}

/**
 * Compounds a single amount forward to `currentDate` at the given rate.
 *
 * @returns Compounded value in the same currency as `amount`, or 0 if the
 *          contribution date is after `currentDate`.
 */
function compoundContribution(
  amount: number,
  annualReturnRate: number,
  date: Date,
  currentDate: Date,
): number {
  const days = differenceInDays(currentDate, date);
  if (days < 0) return 0;
  const dailyRate = annualReturnRate / 365;
  return amount * Math.pow(1 + dailyRate, days);
}

/**
 * Computes the current value of a custom product as the sum of every
 * contribution compounded from its own date.
 *
 * @param contributions - All deposits/withdrawals on the product
 * @param annualReturnRate - Annual return rate (decimal; 0.05 = 5%)
 * @param currentDate - Date to compute the value at (defaults to now)
 * @returns Current value in the product's currency, rounded to 2 decimals
 */
export function calculateCustomProductValueFromContributions(
  contributions: CustomContribution[],
  annualReturnRate: number,
  currentDate: Date = new Date(),
): number {
  assertRate(annualReturnRate);

  const total = contributions.reduce(
    (acc, c) =>
      acc +
      compoundContribution(c.amount, annualReturnRate, c.date, currentDate),
    0,
  );

  return Math.round(total * 100) / 100;
}

/**
 * Net amount invested: sum of every contribution (deposits add, withdrawals
 * subtract). Returned in the product currency.
 *
 * Future-dated contributions are included so the displayed total matches
 * the user's intent — useful when modelling a planned deposit. The
 * compound-value calculation still ignores future-dated contributions so
 * money that has not been deposited cannot accrue interest yet.
 */
export function calculateNetInvestedFromContributions(
  contributions: CustomContribution[],
): number {
  const net = contributions.reduce((acc, c) => acc + c.amount, 0);
  return Math.round(net * 100) / 100;
}

/**
 * Legacy single-contribution variant kept for tests and backwards
 * compatibility. New code should use the contributions-based API.
 */
export async function calculateCustomProductValue(
  initialInvestment: number,
  annualReturnRate: number,
  investmentDate: Date,
  currentDate: Date = new Date(),
): Promise<number> {
  return calculateCustomProductValueSync(
    initialInvestment,
    annualReturnRate,
    investmentDate,
    currentDate,
  );
}

/**
 * Synchronous variant of {@link calculateCustomProductValue}.
 */
export function calculateCustomProductValueSync(
  initialInvestment: number,
  annualReturnRate: number,
  investmentDate: Date,
  currentDate: Date = new Date(),
): number {
  if (initialInvestment <= 0) {
    throw new Error('Initial investment must be positive');
  }
  assertRate(annualReturnRate);
  const days = differenceInDays(currentDate, investmentDate);
  if (days < 0) {
    throw new Error('Investment date cannot be in the future');
  }
  const value = compoundContribution(
    initialInvestment,
    annualReturnRate,
    investmentDate,
    currentDate,
  );
  return Math.round(value * 100) / 100;
}

/**
 * Total return amount = currentValue − netInvested.
 */
export function calculateReturn(
  currentValue: number,
  initialInvestment: number,
): number {
  return Math.round((currentValue - initialInvestment) * 100) / 100;
}

/**
 * Return percentage relative to net invested. Returns 0 if nothing was invested.
 */
export function calculateReturnPercentage(
  currentValue: number,
  initialInvestment: number,
): number {
  if (initialInvestment === 0) return 0;
  const pct = ((currentValue - initialInvestment) / initialInvestment) * 100;
  return Math.round(pct * 100) / 100;
}

/**
 * Daily change in value (today − yesterday).
 */
export function calculateDailyChange(
  currentValue: number,
  previousValue: number,
): number {
  return Math.round((currentValue - previousValue) * 100) / 100;
}

/**
 * Daily change as a percentage of the previous value.
 */
export function calculateDailyChangePercentage(
  currentValue: number,
  previousValue: number,
): number {
  if (previousValue === 0) return 0;
  const pct = ((currentValue - previousValue) / previousValue) * 100;
  return Math.round(pct * 100) / 100;
}
