import { createRunwayGrowth } from './runway-growth';
import type {
  RunwayHolding,
  RunwayPoint,
  RunwayProjection,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';
import {
  calculateFireCoverage,
  effectiveMonthlyRate,
  portfolioRunwayAssumptions,
  validateRunwaySettings,
} from './runway-math';
import { projectFireAccumulation } from './fire-accumulation';

const HORIZON_MONTHS = 600;

/**
 * Projects living off existing capital without new contributions or external income.
 * @param capital - Current nominal EUR capital, already including accrued gains.
 * @param rate - Effective monthly portfolio return.
 * @param settings - Current monthly living cost and annual inflation assumption.
 * @returns Monthly balances and first shortfall; null means none within 50 years.
 * Pure; fractional depletion prorates cash flows evenly within the final month.
 */
function projectRunway(
  capital: number,
  rate: number,
  settings: RunwaySettings,
  growth: (balance: number) => number = (balance) => balance * rate,
) {
  let balance = capital;
  const points: RunwayPoint[] = [
    { month: 0, balance, expenses: 0, income: 0, returns: 0 },
  ];
  for (let month = 1; month <= HORIZON_MONTHS; month++) {
    const expenses =
      settings.monthlyExpenses *
      (1 + settings.annualInflation) ** ((month - 1) / 12);
    const returns = growth(balance);
    if (!Number.isFinite(expenses) || !Number.isFinite(returns)) {
      throw new RangeError('Projection exceeds supported numeric limits');
    }
    const burn = expenses - returns;
    if (balance - burn < -1e-8) {
      const fraction = Math.min(1, Math.max(0, balance / burn));
      if (fraction > 0) {
        points.push({
          month: month - 1 + fraction,
          balance: 0,
          expenses: expenses * fraction,
          income: 0,
          returns: returns * fraction,
        });
      }
      return { runwayPoints: points, runwayMonths: month - 1 + fraction };
    }
    balance = Math.max(0, balance - burn);
    points.push({ month, balance, expenses, income: 0, returns });
  }
  return { runwayPoints: points, runwayMonths: null };
}

/**
 * Computes independent consumption runway and return-funded FIRE accumulation.
 * @param products - Current portfolio values and nominal annual return estimates.
 * @param settings - Only current living costs, inflation and net monthly investment.
 * @returns Unrounded projections; FIRE time is calculated, never an input deadline.
 * No I/O or mutations. Unknown returns use zero; past gains are not counted twice.
 * @throws RangeError when assumptions or resulting calculations are not finite.
 */
export function computeRunwayProjection(
  products: readonly RunwayHolding[],
  settings: RunwaySettings,
): RunwayProjection {
  validateRunwaySettings(settings);
  const portfolio = portfolioRunwayAssumptions(products);
  const monthlyRate = effectiveMonthlyRate(portfolio.annualReturn);
  const firstMonthReturn = createRunwayGrowth(products)(
    portfolio.initialCapital,
  );
  const coverage = calculateFireCoverage(
    portfolio.initialCapital,
    products.some((product) => product.simpleInterest) &&
      portfolio.initialCapital > 0
      ? (1 + firstMonthReturn / portfolio.initialCapital) ** 12 - 1
      : portfolio.annualReturn,
    settings,
  );
  const wealth = projectFireAccumulation(
    portfolio.initialCapital,
    monthlyRate,
    coverage.fireTarget,
    settings,
    HORIZON_MONTHS,
    createRunwayGrowth(products),
  );
  const result: RunwayProjection = {
    ...portfolio,
    ...coverage,
    ...wealth,
    firstMonthReturn,
    netMonthlyBurn: settings.monthlyExpenses - firstMonthReturn,
    ...projectRunway(
      portfolio.initialCapital,
      monthlyRate,
      settings,
      createRunwayGrowth(products),
    ),
    horizonMonths: HORIZON_MONTHS,
  };
  const numbers = [
    result.initialCapital,
    result.firstMonthReturn,
    result.netMonthlyBurn,
    ...result.runwayPoints.map((point) => point.balance),
    ...result.wealthPoints.flatMap((point) => [
      point.balance,
      point.fireTarget ?? 0,
    ]),
  ];
  if (numbers.some((value) => !Number.isFinite(value))) {
    throw new RangeError('Projection exceeds supported numeric limits');
  }
  return result;
}
