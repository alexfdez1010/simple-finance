import { describe, expect, it } from 'vitest';
import { computeSafeRunwayProjection } from '@/lib/domain/services/safe-runway-projection';
import type { RunwaySettings } from '@/lib/domain/models/runway.types';

const settings: RunwaySettings = {
  monthlyExpenses: 1000,
  monthlyIncome: 0,
  annualInflation: 0.02,
  withdrawalRate: 0.04,
  targetYears: 10,
  monthlyContribution: 0,
  annualReturnOverride: null,
};

describe('recoverable runway projection', () => {
  it('returns a valid forecast without an error', () => {
    const result = computeSafeRunwayProjection(
      [{ currentValueEur: 12000, expectedAnnualReturn: 0 }],
      settings,
    );
    expect(result.error).toBeNull();
    expect(result.projection?.initialCapital).toBe(12000);
  });

  it('reports negative positions without silently discarding liabilities', () => {
    const result = computeSafeRunwayProjection(
      [
        { currentValueEur: 12000, expectedAnnualReturn: 0.05 },
        { currentValueEur: -500, expectedAnnualReturn: 0 },
      ],
      settings,
    );
    expect(result.projection).toBeNull();
    expect(result.error).toContain('negative balances');
  });

  it('reports overflowing automatic returns and allows recovery with an override', () => {
    const products = [{ currentValueEur: 12000, expectedAnnualReturn: 1e100 }];
    expect(
      computeSafeRunwayProjection(products, settings).projection,
    ).toBeNull();
    const recovered = computeSafeRunwayProjection(products, {
      ...settings,
      annualReturnOverride: 0,
    });
    expect(recovered.error).toBeNull();
    expect(recovered.projection?.annualReturn).toBe(0);
  });

  it('does not hide unexpected programming errors as financial limitations', () => {
    expect(() =>
      computeSafeRunwayProjection([], null as unknown as RunwaySettings),
    ).toThrow(TypeError);
  });
});
