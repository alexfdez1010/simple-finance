/** Regression tests for EUR enrichment of custom products. */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computeDashboardData } from '@/lib/domain/services/dashboard-data';
import { enrichProductsWithEurValues } from '@/lib/domain/services/product-enrichment';
import { convertProductAmountToEur } from '@/lib/domain/services/product-currency-converter';
import { ensureContributionEurAmounts } from '@/lib/domain/services/contribution-eur-backfill';
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
}));
vi.mock('@/lib/domain/services/contribution-eur-backfill', () => ({
  ensureContributionEurAmounts: vi.fn(),
}));

const timestamp = new Date('2026-04-01T00:00:00Z');
const product: CustomProduct = {
  id: 'trade-republic',
  type: 'CUSTOM',
  assetCategory: 'CASH',
  daysToLiquidity: 0,
  name: 'Trade Republic',
  quantity: 1,
  createdAt: timestamp,
  updatedAt: timestamp,
  custom: {
    id: 'trade-republic-data',
    annualReturnRate: 0.0182,
    currency: 'EUR',
    contributions: [
      {
        id: 'initial-deposit',
        amount: 3_000,
        amountEur: 3_000,
        date: timestamp,
        note: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 'extra-deposit',
        amount: 496.76,
        amountEur: 496.76,
        date: new Date('2026-08-01T00:00:00Z'),
        note: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  },
};

describe('enrichProductsWithEurValues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T00:00:00Z'));
    vi.mocked(ensureContributionEurAmounts).mockResolvedValue([product]);
    vi.mocked(convertProductAmountToEur).mockImplementation(
      async (amount) => amount,
    );
  });

  afterEach(() => vi.useRealTimers());

  it('uses all contributed EUR, not a valuation snapshot, as return basis', async () => {
    const [enriched] = await enrichProductsWithEurValues([product]);
    const { performersData } = computeDashboardData([enriched], []);

    expect(enriched.investedEur).toBe(3_496.76);
    expect(enriched.currentValueEur).toBeGreaterThan(enriched.investedEur);
    expect(performersData[0].returnValue).toBeCloseTo(
      enriched.currentValueEur - 3_496.76,
      8,
    );
    expect(performersData[0].returnPct).toBeGreaterThan(0);
    expect(convertProductAmountToEur).toHaveBeenCalledTimes(1);
  });
});
