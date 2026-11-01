import { describe, expect, it } from 'vitest';
import { computeRunwayProjection } from '@/lib/domain/services/runway-projection';
import type {
  RunwayHolding,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';

const base: RunwaySettings = {
  monthlyExpenses: 1000,
  annualInflation: 0,
  monthlyContribution: 0,
};
const monthlyOnePercent = 1.01 ** 12 - 1;

/** Creates a minimal valued holding without external data or clock access. */
function holding(
  currentValueEur: number,
  expectedAnnualReturn: number | null = 0,
): RunwayHolding {
  return { currentValueEur, expectedAnnualReturn };
}

/** Applies isolated overrides to the three user inputs and an automatic portfolio estimate. */
function project(
  capital = 12000,
  settings: Partial<RunwaySettings> = {},
  annualReturn = 0,
) {
  return computeRunwayProjection([holding(capital, annualReturn)], {
    ...base,
    ...settings,
  });
}

describe('consumption runway', () => {
  it('spends existing capital over exactly twelve months at zero return', () => {
    const result = project();
    expect(result.initialCapital).toBe(12000);
    expect(result.netMonthlyBurn).toBe(1000);
    expect(result.runwayMonths).toBe(12);
    expect(result.runwayPoints[0]).toEqual({
      month: 0,
      balance: 12000,
      expenses: 0,
      income: 0,
      returns: 0,
    });
    expect(result.runwayPoints.at(-1)?.balance).toBe(0);
  });

  it('reports fractional depletion with a zero terminal balance', () => {
    const result = project(12500);
    expect(result.runwayMonths).toBe(12.5);
    expect(result.runwayPoints.at(-1)).toMatchObject({
      month: 12.5,
      balance: 0,
      expenses: 500,
    });
    expect(result.runwayPoints.every((point) => point.balance >= 0)).toBe(true);
  });

  it('applies portfolio returns once to the remaining capital', () => {
    const result = project(12000, {}, monthlyOnePercent);
    expect(result.firstMonthReturn).toBeCloseTo(120, 10);
    expect(result.runwayPoints[1].balance).toBeCloseTo(11120, 10);
    expect(result.runwayPoints[2].returns).toBeCloseTo(111.2, 10);
    expect(result.runwayMonths).toBeGreaterThan(12);
  });

  it('compounds living costs monthly from the current first-month expense', () => {
    const result = project(100000, { annualInflation: 0.12 });
    expect(result.runwayPoints[1].expenses).toBe(1000);
    expect(result.runwayPoints[13].expenses).toBeCloseTo(1120, 9);
    expect(result.runwayMonths).toBeLessThan(project(100000).runwayMonths!);
    expect(result.runwayPoints.every((point) => point.income === 0)).toBe(true);
  });

  it('does not make an initial return surplus perpetual when inflation exceeds growth', () => {
    const result = project(100000, { annualInflation: 0.2 }, 0.15);
    expect(result.netMonthlyBurn).toBeLessThan(0);
    expect(result.runwayMonths).not.toBeNull();
  });

  it('keeps survival bounded to fifty years rather than an infinite claim', () => {
    const result = project(100000, {}, monthlyOnePercent);
    expect(result.runwayMonths).toBeNull();
    expect(result.horizonMonths).toBe(600);
    expect(result.runwayPoints.at(-1)?.month).toBe(600);
  });

  it('reports an immediate shortfall at zero capital', () => {
    expect(project(0).runwayMonths).toBe(0);
    expect(project(0).runwayPoints).toHaveLength(1);
  });

  it('supports negative returns and deflation without non-finite balances', () => {
    const result = project(12000, { annualInflation: -0.02 }, -0.25);
    expect(result.firstMonthReturn).toBeLessThan(0);
    expect(result.runwayMonths).toBeGreaterThan(0);
    expect(result.runwayMonths).toBeLessThan(12);
    expect(
      result.wealthPoints.every((point) => Number.isFinite(point.balance)),
    ).toBe(true);
  });

  it('keeps contributions exclusively in FIRE rather than funding consumption twice', () => {
    const funded = project(12000, { monthlyContribution: 10000 });
    expect(funded.runwayPoints).toEqual(project().runwayPoints);
    expect(funded.netMonthlyBurn).toBe(1000);
  });
});

describe('automatic portfolio return', () => {
  it('weights the entire portfolio, including unknown holdings at zero', () => {
    const result = computeRunwayProjection(
      [holding(10000, 0.1), holding(10000, 0.2), holding(10000, null)],
      base,
    );
    expect(result.initialCapital).toBe(30000);
    expect(result.annualReturn).toBeCloseTo(0.1, 12);
    expect(result.unknownReturnCapital).toBe(10000);
  });

  it('discloses invalid estimates as unknown rather than spending them', () => {
    const result = computeRunwayProjection(
      [holding(100, NaN), holding(100, -1.01), holding(100, Infinity)],
      base,
    );
    expect(result.annualReturn).toBe(0);
    expect(result.unknownReturnCapital).toBe(300);
    expect(result.fireTarget).toBeNull();
  });

  it('retains a known total loss instead of replacing it with zero return', () => {
    const result = project(12000, {}, -1);
    expect(result.annualReturn).toBe(-1);
    expect(result.unknownReturnCapital).toBe(0);
    expect(result.firstMonthReturn).toBe(-12000);
    expect(result.runwayMonths).toBeLessThan(1);
    expect(result.projectedWealth).toBe(0);
    expect(result.fireTarget).toBeNull();
  });

  it('accepts an empty portfolio with zero blended return', () => {
    const result = computeRunwayProjection([], base);
    expect(result.initialCapital).toBe(0);
    expect(result.annualReturn).toBe(0);
    expect(result.runwayMonths).toBe(0);
    expect(result.projectedFireMonth).toBeNull();
  });
});

describe('FIRE derived from monthly cost and real return', () => {
  it('covers costs at the capital implied by the actual real monthly yield', () => {
    const result = project(50000, {}, monthlyOnePercent);
    expect(result.fireTarget).toBeCloseTo(100000, 7);
    expect(result.monthlyFireIncome).toBeCloseTo(500, 9);
    expect(result.monthlyIncomeGap).toBeCloseTo(500, 9);
    expect(result.fireProgress).toBeCloseTo(0.5, 12);
    expect(result.fireGap).toBeCloseTo(50000, 7);
    expect(result.fireReached).toBe(false);
  });

  it('sets FIRE immediately once expected real monthly returns cover the cost', () => {
    for (const capital of [100000, 150000]) {
      const result = project(capital, {}, monthlyOnePercent);
      expect(result.fireReached).toBe(true);
      expect(result.fireProgress).toBe(1);
      expect(result.fireGap).toBe(0);
      expect(result.projectedFireMonth).toBe(0);
      expect(result.projectionMonths).toBe(12);
    }
  });

  it('uses the exact purchasing-power growth factor instead of subtracting percentages', () => {
    const annualReturn = (1 + monthlyOnePercent) * 1.02 - 1;
    const result = project(50000, { annualInflation: 0.02 }, annualReturn);
    expect(result.realAnnualReturn).toBeCloseTo(monthlyOnePercent, 12);
    expect(result.monthlyFireIncome).toBeCloseTo(500, 9);
    expect(result.fireTarget).toBeCloseTo(100000, 7);
  });

  it('requires more capital and provides less monthly coverage when inflation rises', () => {
    const without = project(50000, {}, 0.08);
    const inflated = project(50000, { annualInflation: 0.03 }, 0.08);
    expect(inflated.fireTarget!).toBeGreaterThan(without.fireTarget!);
    expect(inflated.monthlyFireIncome).toBeLessThan(without.monthlyFireIncome);
    expect(inflated.realAnnualReturn).toBeCloseTo(1.08 / 1.03 - 1, 12);
  });

  it.each([
    [0, 0],
    [0.02, 0.02],
    [0.02, 0.03],
    [-0.1, 0],
  ])(
    'does not invent a finite target for return %s and inflation %s',
    (rate, inflation) => {
      const result = project(
        100000,
        { annualInflation: inflation, monthlyContribution: 1000000 },
        rate,
      );
      expect(result.fireTarget).toBeNull();
      expect(result.fireGap).toBeNull();
      expect(result.monthlyFireIncome).toBe(0);
      expect(result.monthlyIncomeGap).toBe(1000);
      expect(result.fireProgress).toBe(0);
      expect(result.fireReached).toBe(false);
      expect(result.projectedFireMonth).toBeNull();
      expect(
        result.wealthPoints.every((point) => point.fireTarget === null),
      ).toBe(true);
    },
  );

  it('supports positive real return during deflation despite negative nominal returns', () => {
    const result = project(100000, { annualInflation: -0.1 }, -0.05);
    expect(result.firstMonthReturn).toBeLessThan(0);
    expect(result.realAnnualReturn).toBeGreaterThan(0);
    expect(result.monthlyFireIncome).toBeGreaterThan(0);
    expect(result.fireTarget).not.toBeNull();
  });

  it('treats zero living costs as already funded without an arbitrary rate', () => {
    const result = project(0, { monthlyExpenses: 0, monthlyContribution: 100 });
    expect(result.fireTarget).toBe(0);
    expect(result.fireReached).toBe(true);
    expect(result.projectedFireMonth).toBe(0);
    expect(result.monthlyIncomeGap).toBe(0);
    expect(result.runwayMonths).toBeNull();
    expect(result.projectedWealth).toBe(1200);
  });

  it('retains small positive real yields rather than rounding them to zero', () => {
    const result = project(100000, {}, Number.EPSILON);
    expect(result.monthlyFireIncome).toBeGreaterThan(0);
    expect(Number.isFinite(result.fireTarget)).toBe(true);
    expect(result.fireTarget!).toBeGreaterThan(1e18);
  });
});

describe('contribution-driven FIRE time', () => {
  it('calculates the first crossing month from monthly investment, not a chosen deadline', () => {
    const result = project(
      10000,
      { monthlyContribution: 1000 },
      monthlyOnePercent,
    );
    const expectedMonth = Math.ceil(Math.log(200000 / 110000) / Math.log(1.01));
    expect(result.projectedFireMonth).toBe(expectedMonth);
    expect(result.projectionMonths).toBe(72);
    expect(result.wealthPoints).toHaveLength(73);
    expect(result.wealthPoints[expectedMonth - 1].balance).toBeLessThan(
      result.fireTarget!,
    );
    expect(result.wealthPoints[expectedMonth].balance).toBeGreaterThanOrEqual(
      result.fireTarget! - 1e-7,
    );
    expect(result).not.toHaveProperty('requiredMonthlyContribution');
    expect(result).not.toHaveProperty('targetCapital');
  });

  it('reaches FIRE earlier with a larger contribution and later with a higher living cost', () => {
    const result = project(
      10000,
      { monthlyContribution: 1000 },
      monthlyOnePercent,
    );
    const moreSaving = project(
      10000,
      { monthlyContribution: 2000 },
      monthlyOnePercent,
    );
    const higherCost = project(
      10000,
      { monthlyExpenses: 2000, monthlyContribution: 1000 },
      monthlyOnePercent,
    );
    expect(moreSaving.projectedFireMonth!).toBeLessThan(
      result.projectedFireMonth!,
    );
    expect(higherCost.projectedFireMonth!).toBeGreaterThan(
      result.projectedFireMonth!,
    );
  });

  it('inflates the FIRE target in the accumulation series', () => {
    const result = project(
      1000,
      { annualInflation: 0.02, monthlyContribution: 100 },
      0.08,
    );
    expect(result.wealthPoints[12].fireTarget).toBeCloseTo(
      result.fireTarget! * 1.02,
      7,
    );
  });

  it('lets current capital grow to FIRE without requiring a new monthly contribution', () => {
    const result = project(50000, {}, monthlyOnePercent);
    expect(result.projectedFireMonth).toBe(
      Math.ceil(Math.log(2) / Math.log(1.01)),
    );
    expect(result.projectedWealth).toBeCloseTo(50000 * 1.01 ** 72, 6);
  });

  it('adds only the net monthly investment, without deducting living costs twice', () => {
    const result = project(10000, { monthlyContribution: 100 });
    expect(result.wealthPoints[1].balance).toBe(10100);
    expect(result.projectedWealth).toBe(70000);
    expect(result.projectionMonths).toBe(600);
    expect(result.projectedFireMonth).toBeNull();
  });

  it('uses a bounded full chart when zero starting capital and zero contribution never grow', () => {
    const result = project(0, {}, monthlyOnePercent);
    expect(result.projectedFireMonth).toBeNull();
    expect(result.wealthPoints).toHaveLength(601);
    expect(result.wealthPoints.at(-1)?.balance).toBe(0);
  });
});

describe('input boundary', () => {
  it.each([
    { monthlyExpenses: -1 },
    { monthlyExpenses: NaN },
    { monthlyContribution: Infinity },
    { monthlyContribution: -1 },
    { annualInflation: -1 },
    { annualInflation: NaN },
    { annualInflation: Infinity },
  ])('rejects invalid assumptions %j', (settings) => {
    expect(() => project(12000, settings)).toThrow(RangeError);
  });

  it.each([-1, Infinity, NaN])('rejects invalid capital %s', (capital) => {
    expect(() => project(capital)).toThrow(RangeError);
  });

  it('rejects numeric overflow instead of displaying an infinite forecast', () => {
    expect(() => project(100000, {}, 1e100)).toThrow(RangeError);
  });

  it('does not mutate holdings or assumptions', () => {
    const settings = Object.freeze({ ...base });
    const products = Object.freeze([Object.freeze(holding(12000, 0.03))]);
    expect(() => computeRunwayProjection(products, settings)).not.toThrow();
    expect(settings).toEqual(base);
    expect(products[0]).toEqual(holding(12000, 0.03));
  });
});
