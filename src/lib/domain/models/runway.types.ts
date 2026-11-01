/** Persisted assumptions. Money is EUR; annual rates are decimals, not percentages. */
export interface RunwaySettings {
  monthlyExpenses: number;
  annualInflation: number;
  /** Net new investment after living costs; used only by the accumulation scenario. */
  monthlyContribution: number;
}

/** Minimal valuation contract; no database or market-data implementation is required. */
export interface RunwayHolding {
  currentValueEur: number;
  expectedAnnualReturn: number | null;
}

/** A projected interval, with its ending balance and the interval's nominal cash flows. */
export interface RunwayPoint {
  month: number;
  balance: number;
  expenses: number;
  /** Runway represents living off capital, so external income is always zero. */
  income: number;
  returns: number;
}

/** End-of-month accumulation balance compared with an inflation-adjusted return-funded target. */
export interface WealthPoint {
  month: number;
  balance: number;
  fireTarget: number | null;
}

/** Deterministic scenarios, not guarantees; portfolio balances already include past gains. */
export interface RunwayProjection {
  initialCapital: number;
  annualReturn: number;
  /** Effective annual purchasing-power growth after inflation. */
  realAnnualReturn: number;
  unknownReturnCapital: number;
  firstMonthReturn: number;
  /** Signed current monthly consumption of capital; negative values indicate a surplus. */
  netMonthlyBurn: number;
  /** First funding shortfall, in fractional months; null means none within 50 years. */
  runwayMonths: number | null;
  horizonMonths: number;
  runwayPoints: RunwayPoint[];
  /** Estimated monthly return available after preserving purchasing power. */
  monthlyFireIncome: number;
  monthlyIncomeGap: number;
  /** Null when a nonpositive real return cannot fund positive living costs. */
  fireTarget: number | null;
  fireReached: boolean;
  /** Fraction of today's target funded, clamped to [0, 1]. */
  fireProgress: number;
  fireGap: number | null;
  wealthPoints: WealthPoint[];
  /** First projected FIRE month, or null if not reached within 50 years. */
  projectedFireMonth: number | null;
  /** Automatic chart horizon: the crossing year, or the 50-year model bound. */
  projectionMonths: number;
  projectedWealth: number;
}
