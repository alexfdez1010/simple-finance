/** Tests for atomic snapshot omission when Yahoo pricing is unavailable. */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  enrichProductsWithEurValues: vi.fn(),
  fetchYahooQuoteWithRetryServer: vi.fn(),
  findAllProducts: vi.fn(),
  upsertPortfolioSnapshot: vi.fn(),
  upsertProductSnapshot: vi.fn(),
}));

vi.mock('@/lib/infrastructure/database/product-repository', () => ({
  findAllProducts: mocks.findAllProducts,
}));
vi.mock('@/lib/domain/services/product-enrichment', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('@/lib/domain/services/product-enrichment')
    >();
  return {
    ...actual,
    enrichProductsWithEurValues: mocks.enrichProductsWithEurValues,
  };
});
vi.mock('@/lib/infrastructure/yahoo-finance/server-client', () => ({
  fetchYahooQuoteWithRetryServer: mocks.fetchYahooQuoteWithRetryServer,
}));
vi.mock('@/lib/infrastructure/database/portfolio-snapshot-repository', () => ({
  upsertPortfolioSnapshot: mocks.upsertPortfolioSnapshot,
}));
vi.mock('@/lib/infrastructure/database/product-snapshot-repository', () => ({
  upsertProductSnapshot: mocks.upsertProductSnapshot,
}));
vi.mock('@/lib/auth/auth-utils', () => ({
  generateAuthToken: (value: string) => value,
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cron/snapshot/route';
import { YahooQuoteUnavailableError } from '@/lib/domain/services/product-enrichment';

describe('snapshot route Yahoo failure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-secret';
    mocks.findAllProducts.mockResolvedValue([{ id: 'apple' }]);
    mocks.enrichProductsWithEurValues.mockRejectedValue(
      new YahooQuoteUnavailableError('apple', 'AAPL'),
    );
  });

  it('returns 503 and writes no partial daily snapshots', async () => {
    const request = new NextRequest('http://localhost/api/cron/snapshot', {
      headers: { authorization: 'Bearer test-secret' },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({
      message: 'Snapshot skipped because a Yahoo quote was unavailable',
      skippedSymbol: 'AAPL',
    });
    expect(mocks.enrichProductsWithEurValues).toHaveBeenCalledWith(
      [{ id: 'apple' }],
      {
        fetchYahooQuote: mocks.fetchYahooQuoteWithRetryServer,
        failOnMissingYahooQuote: true,
      },
    );
    expect(mocks.upsertProductSnapshot).not.toHaveBeenCalled();
    expect(mocks.upsertPortfolioSnapshot).not.toHaveBeenCalled();
  });
  it('captures invested capital from exactly the holdings used for valuation', async () => {
    mocks.enrichProductsWithEurValues.mockResolvedValue([
      { id: 'cash', quantity: 1, currentValueEur: 1210.25, investedEur: 1200 },
      { id: 'fund', quantity: 2, currentValueEur: 520, investedEur: 500 },
    ]);
    mocks.upsertPortfolioSnapshot.mockImplementation(async (date, value) => ({
      date,
      value,
    }));
    const response = await GET(
      new NextRequest('http://localhost/api/cron/snapshot', {
        headers: { authorization: 'Bearer test-secret' },
      }),
    );
    expect(response.status).toBe(200);
    expect(mocks.upsertPortfolioSnapshot).toHaveBeenCalledWith(
      expect.any(Date),
      1730.25,
      1700,
    );
    const date = mocks.upsertPortfolioSnapshot.mock.calls[0][0] as Date;
    expect(date.getUTCHours()).toBe(0);
    expect(date.getUTCMinutes()).toBe(0);
  });
});
