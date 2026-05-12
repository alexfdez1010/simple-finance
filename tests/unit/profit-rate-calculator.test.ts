/**
 * Unit tests for the portfolio profit-rate aggregator. Verifies that Yahoo
 * products feed in via their expected (geometric-mean) annual return on top
 * of the custom products' fixed-rate contribution.
 * @module tests/unit/profit-rate-calculator
 */

import { describe, expect, it } from 'vitest';
import { calculateProfitRatesSync } from '@/lib/domain/services/profit-rate-calculator';
import type { ProductWithValue } from '@/lib/domain/models/product.types';

function customProduct(
  investedEur: number,
  annualReturnRate: number,
): ProductWithValue {
  return {
    id: 'c1',
    type: 'CUSTOM',
    assetCategory: 'CASH',
    name: 'Custom',
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    custom: {
      id: 'cd1',
      annualReturnRate,
      currency: 'EUR',
      contributions: [],
    },
    currentValue: investedEur,
    currentValueEur: investedEur,
    investedEur,
    expectedAnnualReturn: annualReturnRate,
  };
}

function yahooProduct(
  currentValueEur: number,
  expectedAnnualReturn: number | null,
): ProductWithValue {
  return {
    id: 'y1',
    type: 'YAHOO_FINANCE',
    assetCategory: 'STOCKS',
    name: 'Yahoo',
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    yahoo: {
      id: 'yd1',
      symbol: 'AAPL',
      purchasePrice: 100,
      purchaseDate: new Date(),
    },
    currentValue: currentValueEur,
    currentValueEur,
    investedEur: currentValueEur,
    expectedAnnualReturn,
  };
}

describe('calculateProfitRatesSync', () => {
  it('returns all zeros for an empty portfolio', () => {
    const r = calculateProfitRatesSync([]);
    expect(r).toEqual({
      daily: 0,
      weekly: 0,
      monthly: 0,
      annual: 0,
      dailyPct: 0,
      weeklyPct: 0,
      monthlyPct: 0,
      annualPct: 0,
    });
  });

  it('includes Yahoo products via expectedAnnualReturn', () => {
    // 10,000 EUR at 10% annual → ~2.74 EUR/day
    const r = calculateProfitRatesSync([yahooProduct(10000, 0.1)]);
    expect(r.daily).toBeCloseTo(2.74, 1);
    expect(r.annual).toBeCloseTo(1000, 0);
    expect(r.annualPct).toBeCloseTo(10, 1);
  });

  it('skips Yahoo products with unknown expected return', () => {
    const r = calculateProfitRatesSync([yahooProduct(10000, null)]);
    expect(r.daily).toBe(0);
    expect(r.annualPct).toBe(0);
  });

  it('combines custom and Yahoo products weighted by their base', () => {
    // Custom: 10,000 EUR @ 5%  → 500/yr
    // Yahoo:  10,000 EUR @ 15% → 1500/yr
    // Total base 20,000 EUR, annual 2000 → 10% weighted
    const r = calculateProfitRatesSync([
      customProduct(10000, 0.05),
      yahooProduct(10000, 0.15),
    ]);
    expect(r.annual).toBeCloseTo(2000, 0);
    expect(r.annualPct).toBeCloseTo(10, 1);
  });

  it('handles negative Yahoo expected returns', () => {
    const r = calculateProfitRatesSync([yahooProduct(10000, -0.1)]);
    expect(r.annual).toBeCloseTo(-1000, 0);
    expect(r.annualPct).toBeCloseTo(-10, 1);
  });
});
