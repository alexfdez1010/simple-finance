/**
 * Repository for daily per-product value snapshots.
 *
 * Values are stored in EUR — the canonical portfolio currency. Conversion
 * to the user's display currency happens at render time using the same
 * `display-currency-context` as the rest of the dashboard, so every chart
 * stays consistent regardless of the active selector.
 *
 * @module infrastructure/database/product-snapshot-repository
 */

import { prisma } from './prisma-client';

export interface ProductSnapshotPoint {
  date: Date;
  value: number;
}

/**
 * Upsert a product snapshot for a given date. The `quantity` column is
 * preserved on the table (set to the product's live quantity) for
 * historical record but every consumer reads `value` (EUR).
 *
 * @param productId - Product id
 * @param date - Snapshot date (normalised to start of day by caller)
 * @param valueEur - Total value in EUR at the snapshot date
 * @param quantity - Product quantity at snapshot time
 */
export async function upsertProductSnapshot(
  productId: string,
  date: Date,
  valueEur: number,
  quantity: number,
): Promise<void> {
  await prisma.productSnapshot.upsert({
    where: { productId_date: { productId, date } },
    update: { value: valueEur, quantity },
    create: { productId, date, value: valueEur, quantity },
  });
}

/**
 * Returns all snapshots for a product ordered ascending by date.
 *
 * @param productId - Product id
 * @returns Array of `{ date, value }` points (EUR)
 */
export async function findProductSnapshots(
  productId: string,
): Promise<ProductSnapshotPoint[]> {
  const rows = await prisma.productSnapshot.findMany({
    where: { productId },
    orderBy: { date: 'asc' },
    select: { date: true, value: true },
  });
  return rows.map((r) => ({ date: r.date, value: r.value }));
}

/**
 * Returns the earliest stored EUR snapshot for each requested product.
 * Products without snapshots are omitted so callers can apply an explicit
 * fallback until the first daily snapshot exists.
 *
 * @param productIds - Product ids whose historical EUR basis is required
 * @returns Map from product id to its earliest dated snapshot in EUR
 */
export async function findFirstProductSnapshots(
  productIds: string[],
): Promise<Map<string, ProductSnapshotPoint>> {
  if (productIds.length === 0) return new Map();

  const products = await prisma.financialProduct.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      snapshots: {
        orderBy: { date: 'asc' },
        take: 1,
        select: { date: true, value: true },
      },
    },
  });

  return new Map(
    products.flatMap((product) => {
      const firstSnapshot = product.snapshots[0];
      return firstSnapshot ? [[product.id, firstSnapshot]] : [];
    }),
  );
}
