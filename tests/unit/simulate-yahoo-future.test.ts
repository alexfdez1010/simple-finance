/**
 * Unit tests for the Yahoo product future-projection service.
 * @module tests/unit/simulate-yahoo-future
 */

import { describe, expect, it } from 'vitest';
import { simulateYahooFuture } from '@/lib/domain/services/simulate-yahoo-future';

describe('simulateYahooFuture', () => {
  it('returns empty when horizon is zero', () => {
    expect(simulateYahooFuture(100, 0.1, 0)).toEqual([]);
  });

  it('returns empty when annualReturn is null', () => {
    expect(simulateYahooFuture(100, null, 1)).toEqual([]);
  });

  it('returns empty when lastValue is non-positive', () => {
    expect(simulateYahooFuture(0, 0.1, 1)).toEqual([]);
    expect(simulateYahooFuture(-5, 0.1, 1)).toEqual([]);
  });

  it('compounds last value forward at the supplied annual rate', () => {
    // 10% annual → after 1y: ~110
    const start = new Date('2024-12-31');
    const points = simulateYahooFuture(100, 0.1, 1, start);
    expect(points.length).toBeGreaterThan(1);
    expect(points[0]).toEqual({ date: '2024-12-31', value: 100 });
    const last = points[points.length - 1];
    // Monthly stepping lands near 360 days, not exactly 365 → small tolerance
    expect(last.value).toBeGreaterThan(108);
    expect(last.value).toBeLessThan(112);
  });

  it('produces a flat line when annualReturn is zero', () => {
    const points = simulateYahooFuture(50, 0, 2, new Date('2024-12-31'));
    expect(points.every((p) => p.value === 50)).toBe(true);
  });

  it('handles negative annualReturn', () => {
    const points = simulateYahooFuture(100, -0.1, 1, new Date('2024-12-31'));
    const last = points[points.length - 1];
    expect(last.value).toBeLessThan(100);
    expect(last.value).toBeGreaterThan(85);
  });
});
