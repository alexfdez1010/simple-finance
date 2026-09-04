/** Cash-flow-adjusted return basis for custom financial products. */

import type { CustomContribution } from '@/lib/domain/models/product.types';

export interface HistoricalEurSnapshot {
  date: Date;
  value: number;
}

export type HistoricalAmountConverter = (
  amount: number,
  currency: string,
  date: Date,
) => Promise<number>;

/**
 * Adds every effective post-snapshot deposit or withdrawal to the first EUR
 * snapshot. Signed withdrawals reduce the basis. Movements already represented
 * by the snapshot and future-dated movements are excluded.
 *
 * @param firstSnapshot - Earliest stored product value in EUR
 * @param contributions - Signed movements in the product currency
 * @param currency - Currency shared by all movements
 * @param valuationDate - Date through which movements are effective
 * @param convertAtDate - Historical currency conversion dependency
 * @returns First EUR value adjusted by subsequent net cash flows
 */
export async function calculateCustomReturnBasisEur(
  firstSnapshot: HistoricalEurSnapshot,
  contributions: CustomContribution[],
  currency: string,
  valuationDate: Date,
  convertAtDate: HistoricalAmountConverter,
): Promise<number> {
  const firstSnapshotTime = firstSnapshot.date.getTime();
  const valuationTime = valuationDate.getTime();
  const laterMovements = contributions.filter((contribution) => {
    const movementTime = contribution.date.getTime();
    return movementTime > firstSnapshotTime && movementTime <= valuationTime;
  });
  const movementsEur = await Promise.all(
    laterMovements.map((movement) =>
      convertAtDate(movement.amount, currency, movement.date),
    ),
  );

  return movementsEur.reduce(
    (basis, movementEur) => basis + movementEur,
    firstSnapshot.value,
  );
}
