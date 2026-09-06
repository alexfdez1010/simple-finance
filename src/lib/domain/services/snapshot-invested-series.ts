/** Aligns invested capital with the holdings actually included in each snapshot. */
import type { FinancialProduct } from '@/lib/domain/models/product.types';

interface SnapshotBasis {
  date: Date;
  createdAt: Date;
  investedEur: number | null;
}

interface IncludedMovement {
  includedAt: number;
  amountEur: number;
}

/**
 * Builds cash-flow bases from recorded snapshots, reconstructing legacy rows.
 * @param products - Current products with dated movements and resolved EUR bases.
 * @param snapshots - Snapshot dates, capture timestamps and optional frozen bases.
 * @returns Date-aligned cumulative EUR amounts; no input mutation or database writes.
 * Legacy movements count only once both recorded and effective at capture time.
 * Recorded zero is authoritative. Deleted/edited movements and legacy snapshot
 * overwrites cannot be reconstructed exactly without an audit history.
 */
export function getSnapshotInvestedSeries(
  products: readonly FinancialProduct[],
  snapshots: readonly SnapshotBasis[],
): Array<{ date: string; invested: number }> {
  const needsReconstruction = snapshots.some((s) => s.investedEur === null);
  const movements = needsReconstruction ? includedMovements(products) : [];
  return snapshots.map((snapshot) => ({
    date: snapshot.date.toISOString().slice(0, 10),
    invested:
      snapshot.investedEur ??
      movements.reduce(
        (total, movement) =>
          movement.includedAt <= snapshot.createdAt.getTime()
            ? total + movement.amountEur
            : total,
        0,
      ),
  }));
}

/**
 * Maps current movements to their earliest possible inclusion in a snapshot.
 * @param products - Products loaded with their contribution histories.
 * @returns Signed EUR movements; no side effects, empty input yields an empty list.
 * Yahoo holdings enter valuations on creation, even for backdated purchases.
 * @throws When a custom movement lacks its EUR basis.
 */
function includedMovements(
  products: readonly FinancialProduct[],
): IncludedMovement[] {
  return products.flatMap((product) => {
    if (product.type === 'YAHOO_FINANCE') {
      return [
        {
          includedAt: product.createdAt.getTime(),
          amountEur: product.yahoo.purchasePrice * product.quantity,
        },
      ];
    }
    return product.custom.contributions.map((movement) => {
      if (movement.amountEur === null) {
        throw new Error(`Missing EUR basis for contribution ${movement.id}`);
      }
      return {
        includedAt: Math.max(
          product.createdAt.getTime(),
          movement.createdAt.getTime(),
          movement.date.getTime(),
        ),
        amountEur: movement.amountEur,
      };
    });
  });
}
