import type {
  RunwayHolding,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';

/**
 * Validates nominal assumptions before projection, without side effects.
 * @param settings - EUR amounts and decimal annual rates; zero costs are valid.
 * @throws RangeError for non-finite values, negative amounts, or invalid horizons/rates.
 */
export function validateRunwaySettings(settings: RunwaySettings): void {
  for (const value of [
    settings.monthlyExpenses,
    settings.monthlyIncome,
    settings.monthlyContribution,
  ]) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError('Monthly amounts must be finite and non-negative');
    }
  }
  if (
    !Number.isFinite(settings.annualInflation) ||
    settings.annualInflation <= -1 ||
    !Number.isFinite(settings.withdrawalRate) ||
    settings.withdrawalRate <= 0 ||
    settings.withdrawalRate > 1 ||
    (settings.annualReturnOverride !== null &&
      (!Number.isFinite(settings.annualReturnOverride) ||
        settings.annualReturnOverride <= -1))
  ) {
    throw new RangeError('Annual rates are outside their valid range');
  }
  if (
    !Number.isInteger(settings.targetYears) ||
    settings.targetYears < 1 ||
    settings.targetYears > 50
  ) {
    throw new RangeError('Target horizon must be between 1 and 50 whole years');
  }
}

/**
 * Computes a value-weighted nominal rate; unknown/invalid rates contribute zero.
 * @param products - Current EUR valuations; negative or non-finite capital is rejected.
 * @returns Capital, blended decimal annual return, and capital without a usable rate.
 * No mutations or requests; an empty portfolio has zero capital and zero return.
 */
export function portfolioRunwayAssumptions(products: readonly RunwayHolding[]) {
  let initialCapital = 0;
  let annualGain = 0;
  let unknownReturnCapital = 0;
  for (const product of products) {
    const value = product.currentValueEur;
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError('Portfolio capital must be finite and non-negative');
    }
    initialCapital += value;
    const rate = product.expectedAnnualReturn;
    if (rate === null || !Number.isFinite(rate) || rate < -1) {
      unknownReturnCapital += value;
    } else {
      annualGain += value * rate;
    }
  }
  return {
    initialCapital,
    annualReturn: initialCapital > 0 ? annualGain / initialCapital : 0,
    unknownReturnCapital,
  };
}

/**
 * Converts a decimal effective annual rate to its equivalent monthly rate.
 * @param annualRate - Finite annual rate at least -1, validated by the caller.
 * @returns Effective monthly rate; log/exponential forms retain small-rate precision.
 * Pure; a -1 annual estimate retains total loss. No nominal/real adjustment is applied.
 */
export function effectiveMonthlyRate(annualRate: number): number {
  return Math.expm1(Math.log1p(annualRate) / 12);
}

/**
 * Solves the end-of-month fixed-payment annuity needed for a future capital goal.
 * @param capital - Current EUR capital.
 * @param target - Nominal EUR target after the supplied number of months.
 * @param monthlyRate - Effective monthly return, possibly negative.
 * @param months - Positive whole-month horizon.
 * @returns Non-negative monthly contribution; zero if existing growth covers the goal.
 * Pure; the zero-rate limit avoids division by zero and cancellation.
 */
export function requiredMonthlySaving(
  capital: number,
  target: number,
  monthlyRate: number,
  months: number,
): number {
  const growth = Math.exp(months * Math.log1p(monthlyRate));
  const annuity =
    Math.abs(monthlyRate) < 1e-12
      ? months
      : Math.expm1(months * Math.log1p(monthlyRate)) / monthlyRate;
  return Math.max(0, (target - capital * growth) / annuity);
}
