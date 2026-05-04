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
  date: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CustomContribution {
  return {
    id: c.id,
    amount: c.amount,
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
