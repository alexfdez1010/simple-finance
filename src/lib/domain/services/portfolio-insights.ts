/** Pure, currency-independent diagnostics for current portfolio holdings. */
export interface InsightHolding {
  name: string;
  currentValueEur: number;
  investedEur: number;
  daysToLiquidity: number;
  expectedAnnualReturn: number | null;
}

/**
 * Derives concentration, liquidity, gain counts, and forecast coverage.
 * @param holdings - Holdings valued on the same EUR basis; never mutated.
 * @returns Diagnostics, with null percentages when positive capital is absent.
 * Non-finite valuations are excluded. Negative balances do not fund liquidity.
 */
export function computePortfolioInsights(holdings: readonly InsightHolding[]) {
  const valid = holdings.filter((holding) =>
    Number.isFinite(holding.currentValueEur),
  );
  const positive = valid.filter((holding) => holding.currentValueEur > 0);
  const total = positive.reduce(
    (sum, holding) => sum + holding.currentValueEur,
    0,
  );
  const largest = positive.reduce<InsightHolding | null>(
    (best, holding) =>
      !best || holding.currentValueEur > best.currentValueEur ? holding : best,
    null,
  );
  const liquidValue = positive.reduce(
    (sum, holding) =>
      sum +
      (Number.isFinite(holding.daysToLiquidity) &&
      holding.daysToLiquidity >= 0 &&
      holding.daysToLiquidity <= 7
        ? holding.currentValueEur
        : 0),
    0,
  );
  const coveredValue = positive.reduce(
    (sum, holding) =>
      sum +
      (holding.expectedAnnualReturn !== null &&
      Number.isFinite(holding.expectedAnnualReturn)
        ? holding.currentValueEur
        : 0),
    0,
  );
  const comparable = valid.filter(
    (holding) =>
      Number.isFinite(holding.investedEur) && holding.investedEur > 0,
  );
  return {
    largestName: largest?.name ?? null,
    concentrationPct:
      total > 0 ? (largest!.currentValueEur / total) * 100 : null,
    liquidValue,
    liquidPct: total > 0 ? (liquidValue / total) * 100 : null,
    forecastCoveragePct: total > 0 ? (coveredValue / total) * 100 : null,
    profitableCount: comparable.filter(
      (holding) => holding.currentValueEur > holding.investedEur,
    ).length,
    comparableCount: comparable.length,
    excludedCount: holdings.length - valid.length,
  };
}
