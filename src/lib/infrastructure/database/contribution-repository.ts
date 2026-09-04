/**
 * Repository for custom-product contribution data access.
 * Contributions are deposits (positive `amount`) or withdrawals (negative)
 * applied to a custom product over time.
 * @module infrastructure/database/contribution-repository
 */

import { prisma } from './prisma-client';
import type {
  CustomContribution,
  AddContributionInput,
  UpdateContributionInput,
} from '@/lib/domain/models/product.types';

/**
 * Maps a Prisma row into the domain CustomContribution shape.
 */
function mapRow(c: {
  id: string;
  amount: number;
  amountEur: number | null;
  date: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CustomContribution {
  return {
    id: c.id,
    amount: c.amount,
    amountEur: c.amountEur,
    date: c.date,
    note: c.note,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

/**
 * Adds a deposit/withdrawal to a custom product.
 *
 * @param input - Contribution data
 * @returns Created contribution
 */
export async function addContribution(
  input: AddContributionInput,
): Promise<CustomContribution> {
  const created = await prisma.customProductContribution.create({
    data: {
      customProductDataId: input.customProductDataId,
      amount: input.amount,
      amountEur: input.amountEur,
      date: input.date,
      note: input.note ?? null,
    },
  });
  return mapRow(created);
}

/**
 * Updates an existing contribution.
 *
 * @param input - Contribution data
 * @returns Updated contribution
 */
export async function updateContribution(
  input: UpdateContributionInput,
): Promise<CustomContribution> {
  const updated = await prisma.customProductContribution.update({
    where: { id: input.id },
    data: {
      amount: input.amount,
      amountEur: input.amountEur,
      date: input.date,
      note: input.note ?? null,
    },
  });
  return mapRow(updated);
}

/**
 * Permanently deletes a contribution.
 *
 * @param id - Contribution id
 */
export async function deleteContribution(id: string): Promise<void> {
  await prisma.customProductContribution.delete({ where: { id } });
}

/**
 * Finds the immutable currency of a custom product data row.
 *
 * @param customProductDataId - Custom product data id
 * @returns Currency code, or null when the product does not exist
 */
export async function findCustomProductCurrency(
  customProductDataId: string,
): Promise<string | null> {
  const row = await prisma.customProductData.findUnique({
    where: { id: customProductDataId },
    select: { currency: true },
  });
  return row?.currency ?? null;
}

/**
 * Finds the parent currency for an existing contribution.
 *
 * @param id - Contribution id
 * @returns Currency code, or null when the contribution does not exist
 */
export async function findContributionCurrency(
  id: string,
): Promise<string | null> {
  const row = await prisma.customProductContribution.findUnique({
    where: { id },
    select: { customProduct: { select: { currency: true } } },
  });
  return row?.customProduct.currency ?? null;
}

/**
 * Persists a legacy movement's EUR value only when it remains missing.
 * Concurrent backfills are therefore safe and idempotent.
 *
 * @param id - Contribution id
 * @param amountEur - Signed EUR value at the movement date
 * @returns Whether this call filled the row
 */
export async function setContributionAmountEurIfMissing(
  id: string,
  amountEur: number,
): Promise<boolean> {
  const result = await prisma.customProductContribution.updateMany({
    where: { id, amountEur: null },
    data: { amountEur },
  });
  return result.count > 0;
}
