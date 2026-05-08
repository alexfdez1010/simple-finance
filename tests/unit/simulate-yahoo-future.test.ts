/**
 * Unit tests for the Yahoo product future-projection service.
 * @module tests/unit/simulate-yahoo-future
 */

import { describe, expect, it } from 'vitest';
import {
  simulateYahooFuture,
  type HistorySample,
} from '@/lib/domain/services/simulate-yahoo-future';

const sample = (date: string, value: number): HistorySample => ({
  date,
  value,
});

describe('simulateYahooFuture', () => {
  it('returns empty when horizon is zero', () => {
    const history = [sample('2024-01-01', 100), sample('2024-12-31', 110)];
    expect(simulateYahooFuture(history, 0)).toEqual([]);
  });

  it('returns empty when fewer than two points', () => {
    expect(simulateYahooFuture([sample('2024-01-01', 100)], 1)).toEqual([]);
    expect(simulateYahooFuture([], 1)).toEqual([]);
  });

  it('returns empty when first or last value is non-positive', () => {
    expect(
      simulateYahooFuture(
        [sample('2024-01-01', 0), sample('2024-12-31', 100)],
        1,
      ),
    ).toEqual([]);
    expect(
      simulateYahooFuture(
        [sample('2024-01-01', 100), sample('2024-12-31', 0)],
        1,
      ),
    ).toEqual([]);
  });

  it('compounds last value by daily geometric mean over horizon', () => {
    // 100 → 110 over 365 days → daily r = 1.1^(1/365) - 1 ≈ 0.000261
    // After another 365 days: ≈ 121
    const history = [sample('2024-01-01', 100), sample('2024-12-31', 110)];
    const start = new Date('2024-12-31');
    const points = simulateYahooFuture(history, 1, start);
    expect(points.length).toBeGreaterThan(1);
    expect(points[0]).toEqual({ date: '2024-12-31', value: 110 });
    const last = points[points.length - 1];
    // Allow small tolerance from monthly stepping (~360 days, not exactly 365)
    expect(last.value).toBeGreaterThan(118);
    expect(last.value).toBeLessThan(122);
  });

  it('produces a flat line when no growth', () => {
    const history = [sample('2024-01-01', 50), sample('2024-12-31', 50)];
    const points = simulateYahooFuture(history, 2, new Date('2024-12-31'));
    expect(points.every((p) => p.value === 50)).toBe(true);
  });
});
