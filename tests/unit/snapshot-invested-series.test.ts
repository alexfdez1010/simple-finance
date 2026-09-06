/** Regression proof for contributions entered after their day's valuation. */
import { describe, expect, it } from 'vitest';
import type {
  CustomContribution,
  CustomProduct,
  YahooFinanceProduct,
} from '@/lib/domain/models/product.types';
import { getSnapshotInvestedSeries } from '@/lib/domain/services/snapshot-invested-series';
import { computePortfolioRisk } from '@/lib/domain/services/portfolio-risk';
import { getInvestedSeries } from '@/lib/domain/services/contributions-data';

const inception = new Date('2026-09-01T00:00:00Z');

/** Makes an immutable EUR movement with separate effective and entry times. */
function movement(
  amount: number,
  date: string,
  createdAt = date,
): CustomContribution {
  return {
    id: `${amount}-${createdAt}`,
    amount,
    amountEur: amount,
    date: new Date(date),
    createdAt: new Date(createdAt),
    updatedAt: new Date(createdAt),
    note: null,
  };
}

/** Makes a custom holding created before all test snapshots. */
function holding(contributions: CustomContribution[]): CustomProduct {
  return {
    id: 'cash',
    name: 'Cash',
    type: 'CUSTOM',
    assetCategory: 'CASH',
    daysToLiquidity: 0,
    quantity: 1,
    createdAt: inception,
    updatedAt: inception,
    custom: {
      id: 'cash-data',
      currency: 'EUR',
      annualReturnRate: 0,
      contributions,
    },
  };
}

/** Makes a legacy snapshot whose day label differs from its capture timestamp. */
function snapshot(
  day: string,
  value: number,
  investedEur: number | null = null,
) {
  return {
    date: new Date(`${day}T00:00:00Z`),
    createdAt: new Date(`${day}T05:00:00Z`),
    value,
    investedEur,
  };
}

/** Combines snapshot reconstruction with the Risk chart return calculations. */
function risk(
  product: CustomProduct,
  snapshots: ReturnType<typeof snapshot>[],
) {
  return computePortfolioRisk(
    snapshots.map((s) => ({
      date: s.date.toISOString().slice(0, 10),
      value: s.value,
    })),
    getSnapshotInvestedSeries([product], snapshots),
  );
}

describe('snapshot-aligned invested capital', () => {
  it('reproduces the old phantom loss and removes it on both affected days', async () => {
    const product = holding([
      movement(1000, '2026-09-01T00:00:00Z'),
      movement(200, '2026-09-03T00:00:00Z', '2026-09-03T12:00:00Z'),
    ]);
    const snapshots = [
      snapshot('2026-09-02', 1000),
      snapshot('2026-09-03', 1000),
      snapshot('2026-09-04', 1200),
    ];
    const dates = snapshots.map((s) => s.date.toISOString().slice(0, 10));
    const oldResult = computePortfolioRisk(
      snapshots.map((s, i) => ({ date: dates[i], value: s.value })),
      await getInvestedSeries([product], dates),
    );
    expect(oldResult.dailyChanges.map((s) => s.change)).toEqual([-200, 200]);
    expect(risk(product, snapshots).dailyChanges.map((s) => s.change)).toEqual([
      0, 0,
    ]);
    expect(risk(product, snapshots).performance.map((s) => s.value)).toEqual([
      100, 100, 100,
    ]);
  });

  it('preserves actual returns while deferring a same-day withdrawal', () => {
    const product = holding([
      movement(1000, '2026-09-01T00:00:00Z'),
      movement(-200, '2026-09-03T00:00:00Z', '2026-09-03T12:00:00Z'),
    ]);
    const result = risk(product, [
      snapshot('2026-09-02', 1000),
      snapshot('2026-09-03', 1010),
      snapshot('2026-09-04', 820),
    ]);
    expect(result.dailyChanges.map((s) => s.change)).toEqual([10, 10]);
    expect(result.performance[2].value).toBeCloseTo(102);
  });

  it('includes early contributions in the same day snapshot', () => {
    const product = holding([
      movement(1000, '2026-09-01T00:00:00Z'),
      movement(200, '2026-09-03T00:00:00Z', '2026-09-03T04:00:00Z'),
    ]);
    expect(
      risk(product, [
        snapshot('2026-09-02', 1000),
        snapshot('2026-09-03', 1200),
      ]).dailyChanges[0].change,
    ).toBe(0);
  });

  it('does not retroactively insert a backdated contribution into older snapshots', () => {
    const product = holding([
      movement(200, '2026-09-01T00:00:00Z', '2026-09-03T12:00:00Z'),
    ]);
    const result = getSnapshotInvestedSeries(
      [product],
      [snapshot('2026-09-02', 0), snapshot('2026-09-04', 200)],
    );
    expect(result.map((s) => s.invested)).toEqual([0, 200]);
  });

  it('waits for future movements to become effective and respects timezone offsets', () => {
    const product = holding([
      movement(200, '2026-09-03T08:00:00+02:00', '2026-09-01T00:00:00Z'),
    ]);
    expect(
      getSnapshotInvestedSeries(
        [product],
        [snapshot('2026-09-03', 0), snapshot('2026-09-04', 200)],
      ).map((s) => s.invested),
    ).toEqual([0, 200]);
  });

  it('uses captured bases, including zero, despite later ledger changes', () => {
    const product = holding([movement(9999, '2026-09-01T00:00:00Z')]);
    expect(
      getSnapshotInvestedSeries(
        [product],
        [snapshot('2026-09-02', 1000, 1000), snapshot('2026-09-03', 0, 0)],
      ).map((s) => s.invested),
    ).toEqual([1000, 0]);
    expect(
      getSnapshotInvestedSeries([], [snapshot('2026-09-02', 1000, 1000)])[0]
        .invested,
    ).toBe(1000);
  });

  it('supports mixed legacy and captured snapshots', () => {
    const product = holding([movement(1000, '2026-09-01T00:00:00Z')]);
    expect(
      getSnapshotInvestedSeries(
        [product],
        [snapshot('2026-09-02', 1000), snapshot('2026-09-03', 1200, 1200)],
      ).map((s) => s.invested),
    ).toEqual([1000, 1200]);
  });

  it('aligns Yahoo holdings with creation instead of backdated purchases', () => {
    const product: YahooFinanceProduct = {
      ...holding([]),
      type: 'YAHOO_FINANCE',
      createdAt: new Date('2026-09-03T12:00:00Z'),
      yahoo: {
        id: 'quote',
        symbol: 'AAPL',
        purchaseDate: inception,
        purchasePrice: 100,
      },
    };
    expect(
      getSnapshotInvestedSeries(
        [product],
        [snapshot('2026-09-03', 0), snapshot('2026-09-04', 100)],
      ).map((s) => s.invested),
    ).toEqual([0, 100]);
  });

  it('handles empty history and rejects unresolved legacy EUR bases', () => {
    expect(getSnapshotInvestedSeries([], [])).toEqual([]);
    const product = holding([
      { ...movement(1, inception.toISOString()), amountEur: null },
    ]);
    expect(() =>
      getSnapshotInvestedSeries([product], [snapshot('2026-09-02', 1)]),
    ).toThrow('Missing EUR basis');
  });
});
