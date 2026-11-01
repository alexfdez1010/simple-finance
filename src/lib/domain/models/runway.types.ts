/** Persisted assumptions. Money is EUR; annual rates are decimals, not percentages. */
export interface RunwaySettings {
  monthlyExpenses: number;
  monthlyIncome: number;
  annualInflation: number;
  withdrawalRate: number;
  targetYears: number;
  /** Net new investment after living costs; used only by the accumulation scenario. */
  monthlyContribution: number;
  /** Null uses the current portfolio's value-weighted expected nominal return. */
  annualReturnOverride: number | null;
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
  income: number;
  returns: number;
}

/** End-of-month accumulation balance compared with an inflation-adjusted FIRE target. */
export interface WealthPoint {
  month: number;
  balance: number;
  fireTarget: number;
}

/** Deterministic scenarios, not guarantees; portfolio balances already include past gains. */
export interface RunwayProjection {
  initialCapital: number;
  annualReturn: number;
  unknownReturnCapital: number;
  firstMonthReturn: number;
  /** Signed current monthly consumption of capital; negative values indicate a surplus. */
  netMonthlyBurn: number;
  /** First funding shortfall, in fractional months; null means none within 50 years. */
  runwayMonths: number | null;
  horizonMonths: number;
  runwayPoints: RunwayPoint[];
  fireTarget: number;
  fireReached: boolean;
  /** Fraction of today's target funded, clamped to [0, 1]. */
  fireProgress: number;
  fireGap: number;
  requiredMonthlyContribution: number;
  wealthPoints: WealthPoint[];
  /** First projected FIRE month, or null if not reached within 50 years. */
  projectedFireMonth: number | null;
  projectedWealth: number;
  targetCapital: number;
}
