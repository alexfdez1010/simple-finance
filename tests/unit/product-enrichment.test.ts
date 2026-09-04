/**
 * Regression tests for EUR enrichment of custom products.
 * @module tests/unit/product-enrichment
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computeDashboardData } from '@/lib/domain/services/dashboard-data';
import { enrichProductsWithEurValues } from '@/lib/domain/services/product-enrichment';
import {
  convertProductAmountToEur,
  convertProductAmountToEurAtDate,
} from '@/lib/domain/services/product-currency-converter';
import { findFirstProductSnapshots } from '@/lib/infrastructure/database/product-snapshot-repository';
import type { CustomProduct } from '@/lib/domain/models/product.types';

vi.mock('@/lib/infrastructure/yahoo-finance/server-client', () => ({
  fetchYahooQuoteServer: vi.fn(),
}));
vi.mock('@/lib/infrastructure/yahoo-finance/expected-return-client', () => ({
  getYahooExpectedReturn: vi.fn(),
}));
vi.mock('@/lib/infrastructure/currency/currency-history-client', () => ({
  getCurrencyExpectedReturnVsEur: vi.fn().mockResolvedValue(0),
}));
vi.mock('@/lib/domain/services/product-currency-converter', () => ({
  convertProductAmountToEur: vi.fn(),
  convertProductAmountToEurAtDate: vi.fn(),
}));
vi.mock('@/lib/infrastructure/database/product-snapshot-repository', () => ({
  findFirstProductSnapshots: vi.fn(),
}));

const product: CustomProduct = {
  id: 'usd-savings',
  type: 'CUSTOM',
  assetCategory: 'CASH',
  daysToLiquidity: 0,
  name: 'USD savings',
  quantity: 1,
  createdAt: new Date('2025-09-04T00:00:00Z'),
  updatedAt: new Date('2025-09-04T00:00:00Z'),
  custom: {
    id: 'usd-savings-data',
    annualReturnRate: 0.05,
    currency: 'USD',
    contributions: [
      {
        id: 'initial-deposit',
        amount: 1_000,
        date: new Date('2025-09-04T00:00:00Z'),
        note: null,
        createdAt: new Date('2025-09-04T00:00:00Z'),
        updatedAt: new Date('2025-09-04T00:00:00Z'),
      },
      {
        id: 'later-deposit',
        amount: 200,
        date: new Date('2026-03-04T00:00:00Z'),
        note: null,
        createdAt: new Date('2026-03-04T00:00:00Z'),
        updatedAt: new Date('2026-03-04T00:00:00Z'),
      },
    ],
  },
};

describe('enrichProductsWithEurValues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T00:00:00Z'));
    vi.mocked(convertProductAmountToEur).mockImplementation(
      async (amount) => amount * 0.8,
    );
    vi.mocked(convertProductAmountToEurAtDate).mockImplementation(
      async (amount) => amount * 0.75,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('includes both interest and FX movement from the first EUR snapshot', async () => {
    vi.mocked(findFirstProductSnapshots).mockResolvedValue(
      new Map([
        [product.id, { date: new Date('2025-09-04T00:00:00Z'), value: 900 }],
      ]),
    );

    const [enriched] = await enrichProductsWithEurValues([product]);
    const { performersData } = computeDashboardData([enriched], []);

    expect(enriched.currentValueEur).toBeCloseTo(1_005.1, 1);
    expect(enriched.investedEur).toBe(1_050);
    expect(performersData[0].returnValue).toBeCloseTo(-44.9, 1);
    expect(convertProductAmountToEur).toHaveBeenCalledTimes(1);
    expect(convertProductAmountToEurAtDate).toHaveBeenCalledWith(
      200,
      'USD',
      new Date('2026-03-04T00:00:00Z'),
    );
  });

  it('uses the current converted contribution basis before snapshots exist', async () => {
    vi.mocked(findFirstProductSnapshots).mockResolvedValue(new Map());

    const [enriched] = await enrichProductsWithEurValues([product]);

    expect(enriched.investedEur).toBe(960);
    expect(convertProductAmountToEur).toHaveBeenCalledTimes(2);
  });
});
