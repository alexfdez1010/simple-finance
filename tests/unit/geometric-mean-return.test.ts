/**
 * Unit tests for the daily geometric-mean return helper.
 * @module tests/unit/geometric-mean-return
 */

import { describe, expect, it } from 'vitest';
import {
  annualizeDailyRate,
  dailyGeometricReturn,
} from '@/lib/domain/services/geometric-mean-return';
import type { ProductSnapshotPoint } from '@/lib/infrastructure/database/product-snapshot-repository';

const point = (date: string, value: number): ProductSnapshotPoint => ({
  date: new Date(date),
  value,
});

describe('dailyGeometricReturn', () => {
  it('returns null for fewer than two points', () => {
    expect(dailyGeometricReturn([])).toBeNull();
    expect(dailyGeometricReturn([point('2024-01-01', 100)])).toBeNull();
  });

  it('returns null when day span is zero', () => {
    expect(
      dailyGeometricReturn([
        point('2024-01-01', 100),
        point('2024-01-01', 110),
      ]),
    ).toBeNull();
  });

  it('returns null when endpoints are non-positive', () => {
    expect(
      dailyGeometricReturn([point('2024-01-01', 0), point('2024-12-31', 100)]),
    ).toBeNull();
    expect(
      dailyGeometricReturn([point('2024-01-01', 100), point('2024-12-31', 0)]),
    ).toBeNull();
  });

  it('computes daily geometric mean over full span', () => {
    // 100 → 110 over 365 days → r = 1.1^(1/365) - 1
    const r = dailyGeometricReturn([
      point('2024-01-01', 100),
      point('2024-12-31', 110),
    ]);
    expect(r).not.toBeNull();
    expect(r!).toBeCloseTo(Math.pow(1.1, 1 / 365) - 1, 10);
  });

  it('returns zero on a flat series', () => {
    const r = dailyGeometricReturn([
      point('2024-01-01', 50),
      point('2024-12-31', 50),
    ]);
    expect(r).toBe(0);
  });

  it('handles decline (negative daily rate)', () => {
    const r = dailyGeometricReturn([
      point('2024-01-01', 200),
      point('2024-12-31', 100),
    ]);
    expect(r).not.toBeNull();
    expect(r!).toBeLessThan(0);
    expect(r!).toBeCloseTo(Math.pow(0.5, 1 / 365) - 1, 10);
  });

  it('uses endpoints only, ignoring intermediate points', () => {
    // Same start/end → identical rate regardless of middle point
    const a = dailyGeometricReturn([
      point('2024-01-01', 100),
      point('2024-12-31', 110),
    ]);
    const b = dailyGeometricReturn([
      point('2024-01-01', 100),
      point('2024-06-30', 200),
      point('2024-12-31', 110),
    ]);
    expect(a).toBeCloseTo(b!, 10);
  });
});

describe('annualizeDailyRate', () => {
  it('compounds daily rate over 365 days', () => {
    const daily = Math.pow(1.1, 1 / 365) - 1;
    expect(annualizeDailyRate(daily)).toBeCloseTo(0.1, 10);
  });

  it('returns zero when daily rate is zero', () => {
    expect(annualizeDailyRate(0)).toBe(0);
  });

  it('annualizes a negative daily rate', () => {
    const daily = Math.pow(0.5, 1 / 365) - 1;
    expect(annualizeDailyRate(daily)).toBeCloseTo(-0.5, 10);
  });
});
