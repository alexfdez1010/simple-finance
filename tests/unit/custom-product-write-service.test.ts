/** Tests for custom-product writes that freeze movement EUR values. */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addContributionWithEurBasis,
  createCustomProductWithEurBasis,
  updateContributionWithEurBasis,
} from '@/lib/domain/services/custom-product-write-service';
import { convertProductAmountToEurAtDate } from '@/lib/domain/services/product-currency-converter';
import {
  addContribution,
  findContributionCurrency,
  findCustomProductCurrency,
  updateContribution,
} from '@/lib/infrastructure/database/contribution-repository';
import { createCustomProduct } from '@/lib/infrastructure/database/product-repository';

vi.mock('@/lib/domain/services/product-currency-converter', () => ({
  convertProductAmountToEurAtDate: vi.fn(),
}));
vi.mock('@/lib/infrastructure/database/contribution-repository', () => ({
  addContribution: vi.fn(),
  findContributionCurrency: vi.fn(),
  findCustomProductCurrency: vi.fn(),
  updateContribution: vi.fn(),
}));
vi.mock('@/lib/infrastructure/database/product-repository', () => ({
  createCustomProduct: vi.fn(),
}));

const date = new Date('2026-01-02T00:00:00Z');

describe('custom-product write service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(convertProductAmountToEurAtDate).mockImplementation(
      async (amount) => amount * 0.915,
    );
  });

  it('freezes the first movement before creating a product', async () => {
    vi.mocked(createCustomProduct).mockResolvedValue({
      id: 'product',
    } as never);

    await createCustomProductWithEurBasis({
      name: 'Savings',
      annualReturnRate: 0.02,
      currency: 'USD',
      assetCategory: 'CASH',
      daysToLiquidity: 0,
      firstMovement: { amount: 100, date },
    });

    expect(createCustomProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        firstMovement: { amount: 100, date, amountEur: 91.5 },
      }),
    );
  });

  it('uses the parent currency for an additional contribution', async () => {
    vi.mocked(findCustomProductCurrency).mockResolvedValue('USD');
    vi.mocked(addContribution).mockResolvedValue({ id: 'movement' } as never);

    await addContributionWithEurBasis({
      customProductDataId: 'custom',
      amount: 100,
      date,
    });

    expect(addContribution).toHaveBeenCalledWith({
      customProductDataId: 'custom',
      amount: 100,
      amountEur: 91.5,
      date,
    });
  });

  it('recalculates EUR basis when a contribution is edited', async () => {
    vi.mocked(findContributionCurrency).mockResolvedValue('USD');
    vi.mocked(updateContribution).mockResolvedValue({
      id: 'movement',
    } as never);

    await updateContributionWithEurBasis({
      id: 'movement',
      amount: -25,
      date,
      note: 'Withdrawal',
    });

    expect(convertProductAmountToEurAtDate).toHaveBeenCalledWith(
      -25,
      'USD',
      date,
    );
    expect(updateContribution).toHaveBeenCalledWith({
      id: 'movement',
      amount: -25,
      amountEur: -22.875,
      date,
      note: 'Withdrawal',
    });
  });
});
