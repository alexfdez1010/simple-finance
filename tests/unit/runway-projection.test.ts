import { describe, expect, it } from 'vitest';
import { computeRunwayProjection } from '@/lib/domain/services/runway-projection';
import type {
  RunwayHolding,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';

const base: RunwaySettings = {
  monthlyExpenses: 1000,
  monthlyIncome: 0,
  annualInflation: 0,
  withdrawalRate: 0.04,
  targetYears: 10,
  monthlyContribution: 0,
  annualReturnOverride: null,
};

/** Creates a minimal valued holding; no external data or clock access is needed. */
function holding(
  currentValueEur: number,
  expectedAnnualReturn: number | null = 0,
): RunwayHolding {
  return { currentValueEur, expectedAnnualReturn };
}

/** Projects with immutable baseline assumptions and explicit per-test overrides. */
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

  it('subtracts recurring external income from monthly living costs', () => {
    const result = project(12000, { monthlyIncome: 500 });
    expect(result.netMonthlyBurn).toBe(500);
    expect(result.runwayMonths).toBe(24);
  });

  it('reports fractional months and a zero terminal balance', () => {
    const result = project(12500);
    expect(result.runwayMonths).toBe(12.5);
    expect(result.runwayPoints.at(-1)).toMatchObject({
      month: 12.5,
      balance: 0,
      expenses: 500,
    });
    expect(result.runwayPoints.every((point) => point.balance >= 0)).toBe(true);
  });

  it('applies effective monthly returns once to the remaining capital', () => {
    const monthlyRate = 1.12 ** (1 / 12) - 1;
    const result = project(12000, {}, 0.12);
    expect(result.firstMonthReturn).toBeCloseTo(12000 * monthlyRate, 9);
    expect(result.runwayPoints[1].balance).toBeCloseTo(
      12000 * (1 + monthlyRate) - 1000,
      9,
    );
    expect(result.runwayPoints[2].returns).toBeCloseTo(
      result.runwayPoints[1].balance * monthlyRate,
      9,
    );
    expect(result.runwayMonths).toBeGreaterThan(12);
  });

  it('compounds inflation monthly and keeps salary nominally fixed', () => {
    const result = project(100000, {
      monthlyIncome: 300,
      annualInflation: 0.12,
    });
    expect(result.runwayPoints[1].expenses).toBe(1000);
    expect(result.runwayPoints[13].expenses).toBeCloseTo(1120, 9);
    expect(result.runwayPoints[13].income).toBe(300);
    expect(result.runwayMonths).toBeLessThan(
      project(100000, { monthlyIncome: 300 }).runwayMonths!,
    );
  });

  it('does not call a current surplus perpetual when inflation later creates a gap', () => {
    const result = project(12000, {
      monthlyIncome: 1100,
      annualInflation: 0.1,
    });
    expect(result.netMonthlyBurn).toBe(-100);
    expect(result.runwayMonths).not.toBeNull();
  });

  it('marks surviving the projection horizon as null rather than infinity', () => {
    const result = project(0, { monthlyIncome: 1000 });
    expect(result.runwayMonths).toBeNull();
    expect(result.horizonMonths).toBe(600);
    expect(result.runwayPoints.at(-1)?.month).toBe(600);
  });

  it('reports an immediate shortfall when empty capital cannot cover net costs', () => {
    const result = project(0, { monthlyIncome: 999 });
    expect(result.runwayMonths).toBe(0);
    expect(result.runwayPoints).toHaveLength(1);
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
});

describe('portfolio-wide return assumptions', () => {
  it('weights all capital, including unknown holdings at a zero return', () => {
    const result = computeRunwayProjection(
      [holding(10000, 0.1), holding(10000, 0.2), holding(10000, null)],
      base,
    );
    expect(result.initialCapital).toBe(30000);
    expect(result.annualReturn).toBeCloseTo(0.1, 12);
    expect(result.unknownReturnCapital).toBe(10000);
  });

  it('treats invalid market return estimates as unknown rather than spending them', () => {
    const result = computeRunwayProjection(
      [holding(100, Number.NaN), holding(100, -1.01), holding(100, Infinity)],
      base,
    );
    expect(result.annualReturn).toBe(0);
    expect(result.unknownReturnCapital).toBe(300);
  });

  it('models a known total-loss annual estimate rather than treating it as unknown', () => {
    const result = project(12000, {}, -1);
    expect(result.annualReturn).toBe(-1);
    expect(result.unknownReturnCapital).toBe(0);
    expect(result.firstMonthReturn).toBe(-12000);
    expect(result.runwayMonths).toBeLessThan(1);
    expect(result.projectedWealth).toBe(0);
    expect(result.requiredMonthlyContribution).toBe(300000);
  });

  it('supports a deliberate zero return override', () => {
    const result = project(12000, { annualReturnOverride: 0 }, 0.5);
    expect(result.annualReturn).toBe(0);
    expect(result.runwayMonths).toBe(12);
  });

  it('accepts an empty portfolio with a zero blended return', () => {
    const result = computeRunwayProjection([], base);
    expect(result.initialCapital).toBe(0);
    expect(result.annualReturn).toBe(0);
    expect(result.runwayMonths).toBe(0);
  });
});

describe('FIRE target and accumulation', () => {
  it('uses the withdrawal rate and excludes active income from financial independence', () => {
    const result = project(100000, { monthlyIncome: 10000 });
    expect(result.fireTarget).toBe(300000);
    expect(result.fireReached).toBe(false);
    expect(result.fireProgress).toBeCloseTo(1 / 3, 12);
    expect(result.fireGap).toBe(200000);
  });

  it('shows FIRE at or above the required current capital', () => {
    for (const capital of [300000, 400000]) {
      const result = project(capital);
      expect(result.fireReached).toBe(true);
      expect(result.fireProgress).toBe(1);
      expect(result.fireGap).toBe(0);
      expect(result.projectedFireMonth).toBe(0);
    }
  });

  it('solves zero-return monthly savings to reach the target by the chosen year', () => {
    const result = project(100000);
    expect(result.requiredMonthlyContribution).toBeCloseTo(200000 / 120, 9);
    const funded = project(100000, {
      monthlyContribution: result.requiredMonthlyContribution,
    });
    expect(funded.projectedWealth).toBeCloseTo(300000, 7);
    expect(funded.projectedFireMonth).toBe(120);
    expect(funded.wealthPoints).toHaveLength(121);
  });

  it('adjusts future FIRE capital for inflation and solves the compound annuity', () => {
    const result = project(50000, { annualInflation: 0.03 }, 0.07);
    expect(result.targetCapital).toBeCloseTo(300000 * 1.03 ** 10, 6);
    const funded = project(
      50000,
      {
        annualInflation: 0.03,
        monthlyContribution: result.requiredMonthlyContribution,
      },
      0.07,
    );
    expect(funded.projectedWealth).toBeCloseTo(funded.targetCapital, 6);
    expect(funded.projectedFireMonth).toBe(120);
  });

  it('requires no new savings if existing growth reaches the future target', () => {
    const result = project(200000, {}, 0.1);
    expect(result.fireReached).toBe(false);
    expect(result.requiredMonthlyContribution).toBe(0);
    expect(result.projectedFireMonth).toBeGreaterThan(0);
    expect(result.projectedFireMonth).toBeLessThan(120);
  });

  it('keeps net investment separate from salary and expenses in the accumulation scenario', () => {
    const result = project(100000, {
      monthlyIncome: 9000,
      monthlyContribution: 100,
    });
    expect(result.wealthPoints[1].balance).toBe(100100);
    expect(result.projectedWealth).toBe(112000);
    expect(result.projectedFireMonth).toBeNull();
  });

  it('handles zero costs and arbitrarily small return rates', () => {
    const free = project(0, { monthlyExpenses: 0 });
    expect(free.fireTarget).toBe(0);
    expect(free.fireReached).toBe(true);
    expect(free.requiredMonthlyContribution).toBe(0);
    expect(free.runwayMonths).toBeNull();
    const tiny = project(100000, {}, Number.EPSILON);
    expect(tiny.requiredMonthlyContribution).toBeCloseTo(200000 / 120, 8);
  });
});

describe('input boundary', () => {
  it.each([
    { monthlyExpenses: -1 },
    { monthlyIncome: Number.NaN },
    { monthlyContribution: Infinity },
    { annualInflation: -1 },
    { annualInflation: Number.NaN },
    { withdrawalRate: 0 },
    { withdrawalRate: 1.1 },
    { targetYears: 0 },
    { targetYears: 51 },
    { targetYears: 1.5 },
    { annualReturnOverride: -1 },
    { annualReturnOverride: Infinity },
  ])('rejects invalid assumptions %j', (settings) => {
    expect(() => project(12000, settings)).toThrow(RangeError);
  });

  it.each([-1, Infinity, Number.NaN])(
    'rejects invalid capital %s',
    (capital) => {
      expect(() => project(capital)).toThrow(RangeError);
    },
  );

  it('rejects numeric overflow rather than displaying an infinite forecast', () => {
    expect(() => project(100000, { annualReturnOverride: 1e100 })).toThrow(
      RangeError,
    );
  });

  it('does not mutate holdings or assumptions', () => {
    const settings = Object.freeze({ ...base });
    const products = Object.freeze([Object.freeze(holding(12000, 0.03))]);
    expect(() => computeRunwayProjection(products, settings)).not.toThrow();
    expect(settings).toEqual(base);
    expect(products[0]).toEqual(holding(12000, 0.03));
  });
});
