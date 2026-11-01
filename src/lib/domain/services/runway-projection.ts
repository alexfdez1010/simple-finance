import type {
  RunwayHolding,
  RunwayPoint,
  RunwayProjection,
  RunwaySettings,
  WealthPoint,
} from '@/lib/domain/models/runway.types';
import {
  effectiveMonthlyRate,
  portfolioRunwayAssumptions,
  requiredMonthlySaving,
  validateRunwaySettings,
} from './runway-math';

const HORIZON_MONTHS = 600;

/**
 * Projects consumption of existing capital using fixed external net income.
 * @param capital - Current nominal EUR capital, already including accrued returns.
 * @param rate - Effective monthly portfolio return.
 * @param settings - Living costs, income and inflation assumptions.
 * @returns Monthly balances and first shortfall; no shortfall in 50 years gives null.
 * Pure; fractional depletion assumes cash flows accrue evenly within the final month.
 */
function projectRunway(
  capital: number,
  rate: number,
  settings: RunwaySettings,
) {
  let balance = capital;
  const points: RunwayPoint[] = [
    { month: 0, balance, expenses: 0, income: 0, returns: 0 },
  ];
  for (let month = 1; month <= HORIZON_MONTHS; month++) {
    const expenses =
      settings.monthlyExpenses *
      (1 + settings.annualInflation) ** ((month - 1) / 12);
    const returns = balance * rate;
    if (!Number.isFinite(expenses) || !Number.isFinite(returns)) {
      throw new RangeError('Projection exceeds supported numeric limits');
    }
    const burn = expenses - settings.monthlyIncome - returns;
    if (balance - burn < -1e-8) {
      const fraction = Math.min(1, Math.max(0, balance / burn));
      if (fraction > 0) {
        points.push({
          month: month - 1 + fraction,
          balance: 0,
          expenses: expenses * fraction,
          income: settings.monthlyIncome * fraction,
          returns: returns * fraction,
        });
      }
      return { runwayPoints: points, runwayMonths: month - 1 + fraction };
    }
    balance = Math.max(0, balance - burn);
    points.push({
      month,
      balance,
      expenses,
      income: settings.monthlyIncome,
      returns,
    });
  }
  return { runwayPoints: points, runwayMonths: null };
}

/**
 * Projects an independent accumulation scenario with end-of-month investments.
 * @param capital - Current nominal EUR capital.
 * @param rate - Effective monthly portfolio return.
 * @param fireTarget - Today's annual expenses divided by the withdrawal rate.
 * @param settings - Fixed net contribution, inflation, and chosen target horizon.
 * @returns Target-horizon chart and first FIRE crossing within 50 years, if any.
 * Pure; active income is excluded from FIRE and is not added to contributions again.
 */
function projectWealth(
  capital: number,
  rate: number,
  fireTarget: number,
  settings: RunwaySettings,
) {
  let balance = capital;
  let projectedFireMonth: number | null = capital >= fireTarget ? 0 : null;
  const wealthPoints: WealthPoint[] = [{ month: 0, balance, fireTarget }];
  const targetMonths = settings.targetYears * 12;
  for (let month = 1; month <= HORIZON_MONTHS; month++) {
    balance = balance * (1 + rate) + settings.monthlyContribution;
    const inflatedTarget =
      fireTarget * (1 + settings.annualInflation) ** (month / 12);
    if (!Number.isFinite(balance) || !Number.isFinite(inflatedTarget)) {
      throw new RangeError('Projection exceeds supported numeric limits');
    }
    if (
      projectedFireMonth === null &&
      balance >= inflatedTarget - Math.max(1, inflatedTarget) * 1e-12
    ) {
      projectedFireMonth = month;
    }
    if (month <= targetMonths) {
      wealthPoints.push({ month, balance, fireTarget: inflatedTarget });
    }
  }
  return {
    wealthPoints,
    projectedFireMonth,
    projectedWealth: wealthPoints[targetMonths].balance,
    targetCapital: wealthPoints[targetMonths].fireTarget,
  };
}

/**
 * Computes consumption runway, FIRE funding and an independent accumulation plan.
 * @param products - Current portfolio capital and expected nominal annual returns.
 * @param settings - EUR assumptions; annual rates are decimals, with null for auto return.
 * @returns Unrounded nominal projections; null duration means beyond the 50-year limit.
 * No I/O or mutations. Unknown returns use zero; gains already in capital are not added
 * again. FIRE uses the chosen withdrawal rate, excludes salary, and is not a guarantee.
 * @throws RangeError when assumptions or resulting calculations are not finite.
 */
export function computeRunwayProjection(
  products: readonly RunwayHolding[],
  settings: RunwaySettings,
): RunwayProjection {
  validateRunwaySettings(settings);
  const portfolio = portfolioRunwayAssumptions(products);
  const annualReturn = settings.annualReturnOverride ?? portfolio.annualReturn;
  const monthlyRate = effectiveMonthlyRate(annualReturn);
  const firstMonthReturn = portfolio.initialCapital * monthlyRate;
  const fireTarget = (settings.monthlyExpenses * 12) / settings.withdrawalRate;
  const wealth = projectWealth(
    portfolio.initialCapital,
    monthlyRate,
    fireTarget,
    settings,
  );
  const result: RunwayProjection = {
    ...portfolio,
    annualReturn,
    firstMonthReturn,
    netMonthlyBurn:
      settings.monthlyExpenses - settings.monthlyIncome - firstMonthReturn,
    ...projectRunway(portfolio.initialCapital, monthlyRate, settings),
    horizonMonths: HORIZON_MONTHS,
    fireTarget,
    fireReached: portfolio.initialCapital >= fireTarget,
    fireProgress:
      fireTarget > 0 ? Math.min(1, portfolio.initialCapital / fireTarget) : 1,
    fireGap: Math.max(0, fireTarget - portfolio.initialCapital),
    requiredMonthlyContribution: requiredMonthlySaving(
      portfolio.initialCapital,
      wealth.targetCapital,
      monthlyRate,
      settings.targetYears * 12,
    ),
    ...wealth,
  };
  const numbers = [
    result.requiredMonthlyContribution,
    ...result.runwayPoints.map((point) => point.balance),
    ...result.wealthPoints.flatMap((point) => [
      point.balance,
      point.fireTarget,
    ]),
  ];
  if (numbers.some((value) => !Number.isFinite(value))) {
    throw new RangeError('Projection exceeds supported numeric limits');
  }
  return result;
}
