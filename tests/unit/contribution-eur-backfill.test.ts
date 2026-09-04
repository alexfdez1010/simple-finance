/** Tests for idempotent legacy contribution EUR backfill. */

import { describe, expect, it, vi } from 'vitest';
import { ensureContributionEurAmounts } from '@/lib/domain/services/contribution-eur-backfill';
import type { CustomProduct } from '@/lib/domain/models/product.types';

/** Builds a custom product with one legacy movement. */
function legacyProduct(amountEur: number | null): CustomProduct {
  const date = new Date('2025-01-02T00:00:00Z');
  return {
    id: 'product',
    type: 'CUSTOM',
    assetCategory: 'CASH',
    daysToLiquidity: 0,
    name: 'Savings',
    quantity: 1,
    createdAt: date,
    updatedAt: date,
    custom: {
      id: 'custom',
      annualReturnRate: 0.02,
      currency: 'USD',
      contributions: [
        {
          id: 'movement',
          amount: 100,
          amountEur,
          date,
          note: null,
          createdAt: date,
          updatedAt: date,
        },
      ],
    },
  };
}

describe('ensureContributionEurAmounts', () => {
  it('converts and persists a missing historical value once', async () => {
    const convertAtDate = vi.fn().mockResolvedValue(91.5);
    const persistIfMissing = vi.fn().mockResolvedValue(true);

    const [filled] = await ensureContributionEurAmounts([legacyProduct(null)], {
      convertAtDate,
      persistIfMissing,
    });

    expect(
      filled.type === 'CUSTOM' && filled.custom.contributions[0].amountEur,
    ).toBe(91.5);
    expect(convertAtDate).toHaveBeenCalledWith(
      100,
      'USD',
      new Date('2025-01-02T00:00:00Z'),
    );
    expect(persistIfMissing).toHaveBeenCalledWith('movement', 91.5);
  });

  it('does no conversion or write after the value is persisted', async () => {
    const convertAtDate = vi.fn();
    const persistIfMissing = vi.fn();

    const [unchanged] = await ensureContributionEurAmounts(
      [legacyProduct(91.5)],
      { convertAtDate, persistIfMissing },
    );

    expect(unchanged).toEqual(legacyProduct(91.5));
    expect(convertAtDate).not.toHaveBeenCalled();
    expect(persistIfMissing).not.toHaveBeenCalled();
  });
});
