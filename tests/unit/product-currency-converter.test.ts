/** Tests for date-aware product-currency conversion. */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { convertProductAmountToEurAtDate } from '@/lib/domain/services/product-currency-converter';
import { convertToEur } from '@/lib/domain/services/currency-converter';
import { getHistoricalCurrencyRateToEur } from '@/lib/infrastructure/currency/currency-history-client';

vi.mock('@/lib/domain/services/currency-converter', () => ({
  convertToEur: vi.fn(),
}));
vi.mock('@/lib/domain/services/crypto-converter', () => ({
  convertCryptoAssetToEur: vi.fn(),
}));
vi.mock('@/lib/infrastructure/currency/currency-history-client', () => ({
  getHistoricalCurrencyRateToEur: vi.fn(),
}));

describe('convertProductAmountToEurAtDate', () => {
  const date = new Date('2026-08-31T00:00:00Z');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('converts signed movements with their historical EUR rate', async () => {
    vi.mocked(getHistoricalCurrencyRateToEur).mockResolvedValue(0.85);

    await expect(
      convertProductAmountToEurAtDate(-200, 'USD', date),
    ).resolves.toBe(-170);
  });

  it('returns EUR movements unchanged without looking up a rate', async () => {
    await expect(
      convertProductAmountToEurAtDate(200, 'EUR', date),
    ).resolves.toBe(200);
    expect(getHistoricalCurrencyRateToEur).not.toHaveBeenCalled();
  });

  it('falls back to current conversion when history is unavailable', async () => {
    vi.mocked(getHistoricalCurrencyRateToEur).mockResolvedValue(null);
    vi.mocked(convertToEur).mockResolvedValue(160);

    await expect(
      convertProductAmountToEurAtDate(200, 'USD', date),
    ).resolves.toBe(160);
  });
});
