/** Regression tests for EUR enrichment of custom products. */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computeDashboardData } from '@/lib/domain/services/dashboard-data';
import {
  enrichProductsWithEurValues,
  YahooQuoteUnavailableError,
} from '@/lib/domain/services/product-enrichment';
import { convertProductAmountToEur } from '@/lib/domain/services/product-currency-converter';
import { ensureContributionEurAmounts } from '@/lib/domain/services/contribution-eur-backfill';
import type {
  CustomProduct,
  YahooFinanceProduct,
} from '@/lib/domain/models/product.types';

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
    reinvestInterest: true,
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

const yahooProduct: YahooFinanceProduct = {
  id: 'apple',
  type: 'YAHOO_FINANCE',
  assetCategory: 'STOCKS',
  daysToLiquidity: 2,
  name: 'Apple',
  quantity: 2,
  createdAt: timestamp,
  updatedAt: timestamp,
  yahoo: {
    id: 'apple-data',
    symbol: 'AAPL',
    purchasePrice: 100,
    purchaseDate: timestamp,
  },
};

describe('enrichProductsWithEurValues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T00:00:00Z'));
    vi.mocked(ensureContributionEurAmounts).mockImplementation(
      async (products) => products,
    );
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

  it('propagates simple-interest values to dashboard totals, profit and simulation metadata', async () => {
    const simple = {
      ...product,
      custom: {
        ...product.custom,
        reinvestInterest: false,
        annualReturnRate: 0.1,
        contributions: [
          {
            ...product.custom.contributions[0],
            amount: 1000,
            amountEur: 1000,
            date: new Date('2025-09-04T00:00:00Z'),
          },
        ],
      },
    };
    const [enriched] = await enrichProductsWithEurValues([simple]);
    expect(enriched.currentValueEur).toBeCloseTo(1100);
    expect(enriched.investedEur).toBe(1000);
    expect(enriched.expectedAnnualReturn).toBeCloseTo(100 / 1100);
    expect(enriched.simpleInterest).toEqual({
      principalEur: 1000,
      annualRate: 0.1,
      fxAnnualRate: 0,
    });
    const dashboard = computeDashboardData([enriched], []);
    expect(dashboard.stats.totalValue).toBeCloseTo(1100);
    expect(dashboard.stats.totalInvestment).toBe(1000);
    expect(dashboard.liquidityCurve[0].cash).toBeCloseTo(1100);
    expect(dashboard.performersData[0].returnValue).toBeCloseTo(100);
  });

  it('throws before snapshot persistence when strict Yahoo pricing fails', async () => {
    const fetchYahooQuote = vi.fn().mockResolvedValue(null);

    await expect(
      enrichProductsWithEurValues([yahooProduct], {
        fetchYahooQuote,
        failOnMissingYahooQuote: true,
      }),
    ).rejects.toEqual(new YahooQuoteUnavailableError('apple', 'AAPL'));
    expect(fetchYahooQuote).toHaveBeenCalledTimes(1);
  });

  it('keeps the dashboard tolerant of a missing Yahoo quote', async () => {
    const [enriched] = await enrichProductsWithEurValues([yahooProduct], {
      fetchYahooQuote: vi.fn().mockResolvedValue(null),
    });

    expect(enriched.currentValueEur).toBe(0);
    expect(enriched.investedEur).toBe(200);
  });
});
