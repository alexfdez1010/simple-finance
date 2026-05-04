/**
 * Mapping helpers between Prisma rows and domain product types.
 * @module infrastructure/database/product-mappers
 */

import type {
  CustomContribution,
  CustomProduct,
} from '@/lib/domain/models/product.types';

export type CustomDataRow = {
  id: string;
  annualReturnRate: number;
  currency: string;
  contributions: Array<{
    id: string;
    amount: number;
    date: Date;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

/**
 * Maps a Prisma custom-data row into the domain CustomProduct['custom'] shape.
 * Contributions are sorted by date ascending so callers can rely on order.
 */
export function mapCustomData(custom: CustomDataRow): CustomProduct['custom'] {
  return {
    id: custom.id,
    annualReturnRate: custom.annualReturnRate,
    currency: custom.currency,
    contributions: custom.contributions
      .map(
        (c): CustomContribution => ({
          id: c.id,
          amount: c.amount,
          date: c.date,
          note: c.note,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }),
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime()),
  };
}
