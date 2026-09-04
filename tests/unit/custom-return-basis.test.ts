/** Tests for cash-flow-adjusted custom-product return bases. */

import { describe, expect, it, vi } from 'vitest';
import { calculateCustomReturnBasisEur } from '@/lib/domain/services/custom-return-basis';
import type { CustomContribution } from '@/lib/domain/models/product.types';

/** Creates a minimal signed movement at a deterministic UTC date. */
function movement(amount: number, date: string): CustomContribution {
  const timestamp = new Date(`${date}T00:00:00Z`);
  return {
    id: `${date}-${amount}`,
    amount,
    date: timestamp,
    note: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

describe('calculateCustomReturnBasisEur', () => {
  it('adds deposits and subtracts withdrawals after the first snapshot', async () => {
    const convertAtDate = vi.fn(async (amount: number) => amount * 0.8);

    const basis = await calculateCustomReturnBasisEur(
      { date: new Date('2025-01-01T00:00:00Z'), value: 900 },
      [
        movement(1_000, '2025-01-01'),
        movement(200, '2025-06-01'),
        movement(-50, '2025-07-01'),
      ],
      'USD',
      new Date('2025-12-31T00:00:00Z'),
      convertAtDate,
    );

    expect(basis).toBe(1_020);
    expect(convertAtDate).toHaveBeenCalledTimes(2);
  });

  it('ignores movements represented by the snapshot or dated in the future', async () => {
    const convertAtDate = vi.fn(async (amount: number) => amount);

    const basis = await calculateCustomReturnBasisEur(
      { date: new Date('2025-01-01T00:00:00Z'), value: 900 },
      [movement(1_000, '2025-01-01'), movement(500, '2026-01-01')],
      'EUR',
      new Date('2025-12-31T00:00:00Z'),
      convertAtDate,
    );

    expect(basis).toBe(900);
    expect(convertAtDate).not.toHaveBeenCalled();
  });
});
