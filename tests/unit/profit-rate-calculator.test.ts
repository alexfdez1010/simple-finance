/**
 * Unit tests for the snapshot-driven profit-rate calculator.
 * @module tests/unit/profit-rate-calculator
 */

import { describe, expect, it } from 'vitest';
import {
  calculateProfitRatesSync,
  type SnapshotsByProduct,
} from '@/lib/domain/services/profit-rate-calculator';
import type { ProductWithValue } from '@/lib/domain/models/product.types';
import type { ProductSnapshotPoint } from '@/lib/infrastructure/database/product-snapshot-repository';

const now = new Date('2026-01-01');

const point = (date: string, value: number): ProductSnapshotPoint => ({
  date: new Date(date),
  value,
});

const yahoo = (
  id: string,
  currentValueEur: number,
  investedEur: number,
): ProductWithValue => ({
  id,
  type: 'YAHOO_FINANCE',
  assetCategory: 'STOCKS',
  name: `Y-${id}`,
  quantity: 1,
  createdAt: now,
  updatedAt: now,
  yahoo: {
    id: `${id}-y`,
    symbol: 'TEST',
    purchasePrice: investedEur,
    purchaseDate: now,
  },
  currentValue: currentValueEur,
  currentValueEur,
  investedEur,
});

const custom = (
  id: string,
  currentValueEur: number,
  investedEur: number,
  annualReturnRate: number,
): ProductWithValue => ({
  id,
  type: 'CUSTOM',
  assetCategory: 'CASH',
  name: `C-${id}`,
  quantity: 1,
  createdAt: now,
  updatedAt: now,
  custom: {
    id: `${id}-c`,
    annualReturnRate,
    currency: 'EUR',
    contributions: [],
  },
  currentValue: currentValueEur,
  currentValueEur,
  investedEur,
});

describe('calculateProfitRatesSync', () => {
  it('returns zeros when no contributing products', () => {
    const result = calculateProfitRatesSync([], {});
    expect(result).toEqual({
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

  it('skips products with non-positive currentValueEur', () => {
    const products = [yahoo('a', 0, 100), yahoo('b', -5, 100)];
    const result = calculateProfitRatesSync(products, {});
    expect(result.daily).toBe(0);
    expect(result.annual).toBe(0);
  });

  it('skips Yahoo product without enough snapshot history', () => {
    const products = [yahoo('a', 1000, 800)];
    const result = calculateProfitRatesSync(products, {});
    expect(result.daily).toBe(0);
    expect(result.annual).toBe(0);
  });

  it('falls back to contracted annual rate for thin-history custom', () => {
    // 10% annual → daily = 1.1^(1/365) - 1; current value 1000
    const products = [custom('c1', 1000, 1000, 0.1)];
    const result = calculateProfitRatesSync(products, {});
    // Annual profit ≈ 1000 * 0.1 = 100
    expect(result.annual).toBeCloseTo(100, 1);
    // % annual close to 10
    expect(result.annualPct).toBeCloseTo(10, 1);
  });

  it('uses snapshot geometric mean over contracted rate when available', () => {
    // Snapshots imply 20% annual growth, contract says 5% — geom wins
    const snaps: SnapshotsByProduct = {
      c1: [point('2025-01-01', 100), point('2026-01-01', 120)],
    };
    const products = [custom('c1', 1000, 1000, 0.05)];
    const result = calculateProfitRatesSync(products, snaps);
    // r_d = 1.2^(1/365) - 1; annual factor = (1+r_d)^365 = 1.2
    expect(result.annual).toBeCloseTo(200, 1);
    expect(result.annualPct).toBeCloseTo(20, 1);
  });

  it('aggregates Yahoo and Custom together weighted by current value', () => {
    // Yahoo: 1000 EUR, geom annual 10%
    // Custom: 1000 EUR, geom annual 20%
    // Combined annual profit ≈ 100 + 200 = 300; base = 2000 → 15%
    const snaps: SnapshotsByProduct = {
      y1: [point('2025-01-01', 100), point('2026-01-01', 110)],
      c1: [point('2025-01-01', 100), point('2026-01-01', 120)],
    };
    const products = [yahoo('y1', 1000, 800), custom('c1', 1000, 1000, 0.05)];
    const result = calculateProfitRatesSync(products, snaps);
    expect(result.annual).toBeCloseTo(300, 0);
    expect(result.annualPct).toBeCloseTo(15, 1);
  });

  it('produces consistent ordering: daily ≤ weekly ≤ monthly ≤ annual (for positive returns)', () => {
    const snaps: SnapshotsByProduct = {
      y1: [point('2025-01-01', 100), point('2026-01-01', 110)],
    };
    const products = [yahoo('y1', 1000, 800)];
    const r = calculateProfitRatesSync(products, snaps);
    expect(r.daily).toBeLessThanOrEqual(r.weekly);
    expect(r.weekly).toBeLessThanOrEqual(r.monthly);
    expect(r.monthly).toBeLessThanOrEqual(r.annual);
  });

  it('handles a negative geometric return (loss projection)', () => {
    const snaps: SnapshotsByProduct = {
      y1: [point('2025-01-01', 200), point('2026-01-01', 100)],
    };
    const products = [yahoo('y1', 1000, 1500)];
    const r = calculateProfitRatesSync(products, snaps);
    // Loses ~50% per year → annual profit ≈ -500
    expect(r.annual).toBeLessThan(0);
    expect(r.annual).toBeCloseTo(-500, 0);
    expect(r.annualPct).toBeCloseTo(-50, 1);
  });
});
