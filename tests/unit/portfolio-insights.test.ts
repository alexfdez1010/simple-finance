import { describe, expect, it } from 'vitest';
import {
  computePortfolioInsights,
  type InsightHolding,
} from '@/lib/domain/services/portfolio-insights';

/** Creates a deterministic holding with explicit overrides for edge cases. */
function holding(overrides: Partial<InsightHolding> = {}): InsightHolding {
  return {
    name: 'Savings',
    currentValueEur: 100,
    investedEur: 80,
    daysToLiquidity: 0,
    expectedAnnualReturn: 0,
    ...overrides,
  };
}

describe('portfolio insights', () => {
  it('preserves missing percentages for an empty portfolio', () => {
    expect(computePortfolioInsights([])).toMatchObject({
      concentrationPct: null,
      liquidPct: null,
      forecastCoveragePct: null,
      largestName: null,
      comparableCount: 0,
    });
  });
  it('weights coverage and liquidity by value, including zero return estimates', () => {
    const result = computePortfolioInsights([
      holding({ currentValueEur: 300, daysToLiquidity: 7 }),
      holding({
        name: 'Locked',
        daysToLiquidity: 8,
        expectedAnnualReturn: null,
      }),
    ]);
    expect(result).toMatchObject({
      largestName: 'Savings',
      concentrationPct: 75,
      liquidPct: 75,
      liquidValue: 300,
      forecastCoveragePct: 75,
      profitableCount: 2,
    });
  });
  it('excludes negative and zero values from positive capital allocation', () => {
    expect(
      computePortfolioInsights([
        holding(),
        holding({ currentValueEur: -200 }),
        holding({ currentValueEur: 0 }),
      ]),
    ).toMatchObject({
      concentrationPct: 100,
      liquidPct: 100,
      liquidValue: 100,
      profitableCount: 1,
      comparableCount: 3,
    });
  });
  it('excludes unavailable valuations and unknown metadata from coverage', () => {
    expect(
      computePortfolioInsights([
        holding({ currentValueEur: NaN }),
        holding({ currentValueEur: Infinity }),
        holding({ daysToLiquidity: NaN, expectedAnnualReturn: Infinity }),
      ]),
    ).toMatchObject({ excludedCount: 2, liquidPct: 0, forecastCoveragePct: 0 });
  });
  it('does not classify zero basis, invalid basis or break-even holdings as profitable', () => {
    expect(
      computePortfolioInsights([
        holding({ investedEur: 0 }),
        holding({ investedEur: NaN }),
        holding({ investedEur: 100 }),
      ]),
    ).toMatchObject({ profitableCount: 0, comparableCount: 1 });
  });
  it('does not mutate input or treat negative settlement days as liquid', () => {
    const input = Object.freeze([
      Object.freeze(holding({ daysToLiquidity: -1 })),
    ]);
    expect(computePortfolioInsights(input).liquidPct).toBe(0);
    expect(input[0].daysToLiquidity).toBe(-1);
  });
});
