/**
 * Unit tests for the yield + FX-geomean combination helper.
 * @module tests/unit/custom-expected-return
 */

import { describe, expect, it } from 'vitest';
import { combineExpectedReturn } from '@/lib/domain/services/custom-expected-return';

describe('combineExpectedReturn', () => {
  it('returns the yield unchanged when FX geomean is null', () => {
    expect(combineExpectedReturn(0.05, null)).toBe(0.05);
  });

  it('returns the yield unchanged when FX geomean is zero (EUR product)', () => {
    expect(combineExpectedReturn(0.05, 0)).toBeCloseTo(0.05, 10);
  });

  it('compounds the two rates: (1+y)(1+fx) - 1', () => {
    // 5% yield, +3% FX appreciation → 1.05 * 1.03 - 1 = 0.0815
    expect(combineExpectedReturn(0.05, 0.03)).toBeCloseTo(0.0815, 10);
  });

  it('handles negative FX geomean (currency depreciation)', () => {
    // 5% yield, -2% FX → 1.05 * 0.98 - 1 = 0.029
    expect(combineExpectedReturn(0.05, -0.02)).toBeCloseTo(0.029, 10);
  });

  it('handles negative yield', () => {
    // -3% yield, +4% FX → 0.97 * 1.04 - 1 = 0.0088
    expect(combineExpectedReturn(-0.03, 0.04)).toBeCloseTo(0.0088, 10);
  });

  it('returns zero when both inputs are zero', () => {
    expect(combineExpectedReturn(0, 0)).toBe(0);
  });
});
