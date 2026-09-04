/** Tests for historical currency-to-EUR rate lookup. */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { chart } = vi.hoisted(() => ({ chart: vi.fn() }));

vi.mock('next/cache', () => ({
  unstable_cache: (callback: unknown) => callback,
}));
vi.mock('yahoo-finance2', () => ({
  default: class YahooFinanceMock {
    chart = chart;
  },
}));

import { getHistoricalCurrencyRateToEur } from '@/lib/infrastructure/currency/currency-history-client';

describe('getHistoricalCurrencyRateToEur', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the latest available USD close on or before the movement date', async () => {
    chart.mockResolvedValue({
      quotes: [
        { date: new Date('2026-08-28T00:00:00Z'), close: 0.86 },
        { date: new Date('2026-08-31T00:00:00Z'), close: 0.85 },
      ],
    });

    await expect(
      getHistoricalCurrencyRateToEur('USD', new Date('2026-08-31T00:00:00Z')),
    ).resolves.toBe(0.85);
    expect(chart).toHaveBeenCalledWith('USDEUR=X', {
      period1: new Date('2026-08-24T00:00:00Z'),
      period2: new Date('2026-09-01T00:00:00Z'),
      interval: '1d',
    });
  });

  it('composes XAUT/USD and USD/EUR closes from the same date', async () => {
    chart.mockImplementation(async (ticker: string) => ({
      quotes: [
        {
          date: new Date('2026-08-31T00:00:00Z'),
          close: ticker === 'XAUT-USD' ? 2_500 : 0.8,
        },
      ],
    }));

    await expect(
      getHistoricalCurrencyRateToEur('XAUT', new Date('2026-08-31T00:00:00Z')),
    ).resolves.toBe(2_000);
  });

  it('returns null for an unsupported currency without a network call', async () => {
    await expect(
      getHistoricalCurrencyRateToEur('GBP', new Date('2026-08-31T00:00:00Z')),
    ).resolves.toBeNull();
    expect(chart).not.toHaveBeenCalled();
  });
});
