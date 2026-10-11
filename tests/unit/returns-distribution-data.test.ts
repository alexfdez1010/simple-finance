import { describe, expect, it } from 'vitest';
import { computeReturnDistribution } from '@/components/dashboard/returns-distribution-data';

describe('snapshot change distribution', () => {
  it('keeps an empty sample explicit', () => {
    expect(computeReturnDistribution([])).toEqual({
      bins: [],
      mean: 0,
      var5: 0,
      hitRate: 0,
      sample: 0,
    });
  });
  it('preserves signed percentage changes and counts every observation once', () => {
    const input = [100, 110, 99, 99].map((value, index) => ({
      date: String(index),
      value,
    }));
    const original = structuredClone(input);
    const distribution = computeReturnDistribution(input);
    expect(distribution.sample).toBe(3);
    expect(distribution.mean).toBeCloseTo(0);
    expect(distribution.var5).toBeCloseTo(-10);
    expect(distribution.hitRate).toBeCloseTo(100 / 3);
    expect(distribution.bins.reduce((total, bin) => total + bin.count, 0)).toBe(
      3,
    );
    expect(input).toEqual(original);
  });
  it('skips percentages with a zero or negative starting balance', () => {
    const distribution = computeReturnDistribution(
      [0, -5, 10, 11].map((value) => ({ date: '', value })),
    );
    expect(distribution.sample).toBe(1);
    expect(distribution.mean).toBeCloseTo(10);
    expect(distribution.hitRate).toBe(100);
  });
  it('handles constant values without a collapsed histogram', () => {
    const distribution = computeReturnDistribution(
      [100, 100, 100].map((value) => ({ date: '', value })),
    );
    expect(distribution.bins).toHaveLength(51);
    expect(distribution.bins.reduce((total, bin) => total + bin.count, 0)).toBe(
      2,
    );
    expect(distribution.hitRate).toBe(0);
  });
});
