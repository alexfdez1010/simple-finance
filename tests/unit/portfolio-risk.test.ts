import { describe, expect, it } from 'vitest';
import { computePortfolioRisk } from '@/lib/domain/services/portfolio-risk';

/** Builds aligned snapshots and contribution bases without mutating fixtures. */
function compute(values: number[], bases: number[]) {
  return computePortfolioRisk(
    values.map((value, i) => ({ date: `2026-09-0${i + 1}`, value })),
    bases.map((invested, i) => ({ date: `2026-09-0${i + 1}`, invested })),
  );
}

describe('cash-flow-adjusted risk', () => {
  it('removes deposits, withdrawals and full withdrawal without inventing returns', () => {
    const result = compute([100, 150, 120, 0, 80], [100, 150, 120, 0, 80]);
    expect(result.performance.map((p) => p.value)).toEqual([
      100, 100, 100, 100, 100,
    ]);
    expect(result.dailyChanges.map((p) => p.change)).toEqual([0, 0, 0, 0]);
  });
  it('preserves gains and compounds against actual opening capital after a deposit', () => {
    const result = compute([100, 160, 176], [100, 150, 150]);
    expect(result.dailyChanges.map((p) => p.change)).toEqual([10, 16]);
    expect(result.performance[1].value).toBeCloseTo(110);
    expect(result.performance[2].value).toBeCloseTo(121);
  });
  it('does not let deposits hide losses or withdrawals exaggerate them', () => {
    const result = compute([100, 140, 116], [100, 150, 140]);
    expect(result.dailyChanges.map((p) => p.change)).toEqual([-10, -14]);
    expect(result.performance[1].value).toBeCloseTo(90);
    expect(result.performance[2].value).toBeCloseTo(81);
  });
  it('preserves ordinary returns without flows', () => {
    expect(
      compute([100, 110, 99], [100, 100, 100]).performance[2].value,
    ).toBeCloseTo(99);
  });
  it('uses dates instead of contribution-array positions across snapshot gaps', () => {
    const result = computePortfolioRisk(
      [
        { date: '2026-09-01', value: 100 },
        { date: '2026-09-06', value: 180 },
      ],
      [
        { date: '2026-09-06', invested: 180 },
        { date: '2026-09-01', invested: 100 },
      ],
    );
    expect(result.dailyChanges[0].change).toBe(0);
  });
  it('handles empty, single and initially unfunded histories', () => {
    expect(compute([], [])).toEqual({ performance: [], dailyChanges: [] });
    expect(compute([100], [100]).dailyChanges).toEqual([]);
    expect(
      compute([0, 100, 110], [0, 100, 100]).performance[2].value,
    ).toBeCloseTo(110);
  });
  it('rejects missing contribution history instead of silently including flows', () => {
    expect(() => compute([100, 150], [100])).toThrow(
      'Missing contribution basis',
    );
  });
});
