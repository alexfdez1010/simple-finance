/** Tests for persisted custom-product EUR return bases. */

import { describe, expect, it } from 'vitest';
import { calculateCustomReturnBasisEur } from '@/lib/domain/services/custom-return-basis';
import type { CustomContribution } from '@/lib/domain/models/product.types';

/** Creates a deterministic signed movement with a frozen EUR value. */
function movement(
  amount: number,
  amountEur: number | null,
  date: string,
): CustomContribution {
  const timestamp = new Date(`${date}T00:00:00Z`);
  return {
    id: `${date}-${amount}`,
    amount,
    amountEur,
    date: timestamp,
    note: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

describe('calculateCustomReturnBasisEur', () => {
  it('sums every deposit and withdrawal at its persisted EUR value', () => {
    const basis = calculateCustomReturnBasisEur(
      [
        movement(1_000, 900, '2025-01-01'),
        movement(200, 150, '2025-06-01'),
        movement(-50, -40, '2025-07-01'),
      ],
      new Date('2025-12-31T00:00:00Z'),
    );

    expect(basis).toBe(1_010);
  });

  it('produces the Trade Republic basis shown in the regression report', () => {
    const basis = calculateCustomReturnBasisEur(
      [movement(3_496.76, 3_496.76, '2026-04-01')],
      new Date('2026-09-04T00:00:00Z'),
    );

    expect(3_514.32 - basis).toBeCloseTo(17.56, 2);
    expect(((3_514.32 - basis) / basis) * 100).toBeCloseTo(0.5, 2);
  });

  it('ignores future movements and rejects unresolved legacy rows', () => {
    expect(
      calculateCustomReturnBasisEur(
        [movement(100, 100, '2025-01-01'), movement(500, 500, '2026-01-01')],
        new Date('2025-12-31T00:00:00Z'),
      ),
    ).toBe(100);

    expect(() =>
      calculateCustomReturnBasisEur(
        [movement(100, null, '2025-01-01')],
        new Date('2025-12-31T00:00:00Z'),
      ),
    ).toThrow('Missing EUR basis');
  });
});
