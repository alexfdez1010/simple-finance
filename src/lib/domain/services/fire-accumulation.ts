import type {
  RunwaySettings,
  WealthPoint,
} from '@/lib/domain/models/runway.types';

/**
 * Projects wealth with month-end investment and derives the first funded FIRE month.
 * @param capital - Current nominal EUR portfolio value.
 * @param rate - Effective monthly nominal portfolio return.
 * @param fireTarget - Current cost-funded target, or null for nonpositive real return.
 * @param settings - Fixed monthly investment after costs and annual inflation.
 * @param horizonMonths - Maximum simulation length, shared with consumption runway.
 * @returns A chart through the crossing year, or the full bound if FIRE is not reached.
 * Pure; living costs are already excluded from contributions and not subtracted again.
 */
export function projectFireAccumulation(
  capital: number,
  rate: number,
  fireTarget: number | null,
  settings: RunwaySettings,
  horizonMonths: number,
) {
  let balance = capital;
  let projectedFireMonth: number | null =
    fireTarget !== null &&
    capital >= fireTarget - Math.max(1, fireTarget) * 1e-12
      ? 0
      : null;
  let projectionMonths =
    projectedFireMonth === 0 ? Math.min(12, horizonMonths) : horizonMonths;
  const wealthPoints: WealthPoint[] = [{ month: 0, balance, fireTarget }];
  for (let month = 1; month <= projectionMonths; month++) {
    balance = balance * (1 + rate) + settings.monthlyContribution;
    const inflatedTarget =
      fireTarget === null
        ? null
        : fireTarget * (1 + settings.annualInflation) ** (month / 12);
    if (!Number.isFinite(balance) || !Number.isFinite(inflatedTarget ?? 0)) {
      throw new RangeError('Projection exceeds supported numeric limits');
    }
    if (
      projectedFireMonth === null &&
      inflatedTarget !== null &&
      balance >= inflatedTarget - Math.max(1, inflatedTarget) * 1e-12
    ) {
      projectedFireMonth = month;
      projectionMonths = Math.min(
        horizonMonths,
        Math.max(12, Math.ceil(month / 12) * 12),
      );
    }
    wealthPoints.push({ month, balance, fireTarget: inflatedTarget });
  }
  return {
    wealthPoints,
    projectedFireMonth,
    projectionMonths,
    projectedWealth: wealthPoints.at(-1)!.balance,
  };
}
