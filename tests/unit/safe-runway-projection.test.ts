import { describe, expect, it } from 'vitest';
import { computeSafeRunwayProjection } from '@/lib/domain/services/safe-runway-projection';
import type { RunwaySettings } from '@/lib/domain/models/runway.types';

const settings: RunwaySettings = {
  monthlyExpenses: 1000,
  annualInflation: 0.02,
  monthlyContribution: 0,
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

  it('reports negative positions without silently dropping liabilities', () => {
    const result = computeSafeRunwayProjection(
      [
        { currentValueEur: 12000, expectedAnnualReturn: 0.05 },
        { currentValueEur: -500, expectedAnnualReturn: 0 },
      ],
      settings,
    );
    expect(result.projection).toBeNull();
    expect(result.error).toContain('balances and return estimates');
  });

  it('reports overflowing automatic returns without offering a removed override', () => {
    const result = computeSafeRunwayProjection(
      [{ currentValueEur: 12000, expectedAnnualReturn: 1e100 }],
      settings,
    );
    expect(result.projection).toBeNull();
    expect(result.error).toContain('return estimates');
    expect(result.error).not.toContain('lower return');
  });

  it('does not hide unexpected programming errors as financial limitations', () => {
    expect(() =>
      computeSafeRunwayProjection([], null as unknown as RunwaySettings),
    ).toThrow(TypeError);
  });
});
