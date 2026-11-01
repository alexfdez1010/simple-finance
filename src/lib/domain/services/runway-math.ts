import type {
  RunwayHolding,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';

/**
 * Validates the three simulation inputs without side effects.
 * @param settings - EUR living costs/contribution and decimal annual inflation.
 * @throws RangeError for non-finite values, negative amounts or inflation at/below -100%.
 */
export function validateRunwaySettings(settings: RunwaySettings): void {
  for (const value of [
    settings.monthlyExpenses,
    settings.monthlyContribution,
  ]) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError('Monthly amounts must be finite and non-negative');
    }
  }
  if (
    !Number.isFinite(settings.annualInflation) ||
    settings.annualInflation <= -1
  ) {
    throw new RangeError('Annual inflation is outside its valid range');
  }
}

/**
 * Computes a value-weighted nominal rate; unknown/invalid rates contribute zero.
 * @param products - Current EUR valuations; negative or non-finite capital is rejected.
 * @returns Capital, blended decimal annual return and capital without a usable estimate.
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
 * Converts an effective annual rate to its equivalent monthly rate.
 * @param annualRate - Finite annual rate at least -1, validated by the caller.
 * @returns Effective monthly rate; log/exponential forms retain small-rate precision.
 * Pure; a -1 annual estimate retains a known total loss.
 */
export function effectiveMonthlyRate(annualRate: number): number {
  return Math.expm1(Math.log1p(annualRate) / 12);
}

/**
 * Derives return-funded FIRE from monthly costs without an arbitrary withdrawal rate.
 * @param capital - Current EUR capital.
 * @param annualReturn - Expected nominal annual return, including a known total loss.
 * @param settings - Current living cost and decimal annual inflation.
 * @returns Real return, monthly coverage and target; null when no finite target exists.
 * Pure; zero costs need zero capital, even at nonpositive real returns.
 */
export function calculateFireCoverage(
  capital: number,
  annualReturn: number,
  settings: Pick<RunwaySettings, 'monthlyExpenses' | 'annualInflation'>,
) {
  const realGrowth =
    Math.log1p(annualReturn) - Math.log1p(settings.annualInflation);
  const realAnnualReturn = Math.expm1(realGrowth);
  const realMonthlyReturn = Math.expm1(realGrowth / 12);
  const monthlyFireIncome = Math.max(0, capital * realMonthlyReturn);
  const fireTarget =
    settings.monthlyExpenses === 0
      ? 0
      : realMonthlyReturn > 0
        ? settings.monthlyExpenses / realMonthlyReturn
        : null;
  if (
    ![realAnnualReturn, monthlyFireIncome, fireTarget ?? 0].every(
      Number.isFinite,
    )
  ) {
    throw new RangeError('Projection exceeds supported numeric limits');
  }
  const fireReached =
    fireTarget !== null &&
    capital >= fireTarget - Math.max(1, fireTarget) * 1e-12;
  return {
    realAnnualReturn,
    monthlyFireIncome,
    monthlyIncomeGap: Math.max(0, settings.monthlyExpenses - monthlyFireIncome),
    fireTarget,
    fireReached,
    fireProgress: fireReached
      ? 1
      : fireTarget === null
        ? 0
        : Math.min(1, capital / fireTarget),
    fireGap:
      fireTarget === null
        ? null
        : fireReached
          ? 0
          : Math.max(0, fireTarget - capital),
  };
}
