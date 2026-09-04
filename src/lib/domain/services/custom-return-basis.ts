/** Persisted cash-flow return basis for custom financial products. */

import type { CustomContribution } from '@/lib/domain/models/product.types';

/**
 * Sums effective signed movements using their immutable date-specific EUR
 * values. Deposits increase the basis and withdrawals reduce it; accrued
 * interest and currency movement are therefore left exclusively in return.
 *
 * @param contributions - Signed movements with persisted EUR values
 * @param valuationDate - Date through which movements are effective
 * @returns Net contributed capital in EUR
 * @throws When a legacy row has not been backfilled before calculation
 */
export function calculateCustomReturnBasisEur(
  contributions: CustomContribution[],
  valuationDate: Date,
): number {
  const valuationTime = valuationDate.getTime();
  return contributions.reduce((basis, contribution) => {
    if (contribution.date.getTime() > valuationTime) return basis;
    if (contribution.amountEur == null) {
      throw new Error(`Missing EUR basis for contribution ${contribution.id}`);
    }
    return basis + contribution.amountEur;
  }, 0);
}
