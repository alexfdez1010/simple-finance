/**
 * Unit tests for the cash-availability (liquidity) curve derived by
 * computeDashboardData. Verifies cumulative cash by day threshold,
 * the always-present day-0 point, and grouping of equal horizons.
 * @module tests/unit/dashboard-liquidity-curve
 */

import { describe, expect, it } from 'vitest';
import { computeDashboardData } from '@/lib/domain/services/dashboard-data';
import type { ProductWithValue } from '@/lib/domain/models/product.types';

function product(
  id: string,
  currentValueEur: number,
  daysToLiquidity: number,
): ProductWithValue {
  return {
    id,
    type: 'CUSTOM',
    assetCategory: 'CASH',
    daysToLiquidity,
    name: id,
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    custom: {
      id: `${id}-d`,
      annualReturnRate: 0,
      currency: 'EUR',
      contributions: [],
    },
    currentValue: currentValueEur,
    currentValueEur,
    investedEur: currentValueEur,
    expectedAnnualReturn: 0,
  };
}

describe('computeDashboardData liquidityCurve', () => {
  it('returns a single zeroed day-0 point for an empty portfolio', () => {
    const { liquidityCurve } = computeDashboardData([], []);
    expect(liquidityCurve).toEqual([{ days: 0, cash: 0 }]);
  });

  it('accumulates cash across ascending day thresholds', () => {
    const { liquidityCurve } = computeDashboardData(
      [product('a', 100, 0), product('b', 200, 7), product('c', 50, 30)],
      [],
    );
    expect(liquidityCurve).toEqual([
      { days: 0, cash: 100 },
      { days: 7, cash: 300 },
      { days: 30, cash: 350 },
    ]);
  });

  it('groups assets sharing a horizon and injects a zero day-0 point when none is instant', () => {
    const { liquidityCurve } = computeDashboardData(
      [product('a', 100, 5), product('b', 200, 5)],
      [],
    );
    expect(liquidityCurve).toEqual([
      { days: 0, cash: 0 },
      { days: 5, cash: 300 },
    ]);
  });
});
