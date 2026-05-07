/**
 * Shared input schemas and helpers for MCP asset tools.
 * @module lib/mcp/tools/shared
 */

import { z } from 'zod';
import { ASSET_CATEGORIES } from '@/lib/domain/models/asset-category';

export const ASSET_CURRENCIES = ['EUR', 'USD', 'BTC', 'ETH', 'XAUT'] as const;

const assetCategoryField = z
  .enum(ASSET_CATEGORIES as unknown as [string, ...string[]])
  .describe(
    'High-level asset class: STOCKS, BONDS_LOANS, COMMODITIES, REAL_ESTATE, CASH.',
  );

/**
 * Common Zod fields for a Yahoo Finance asset.
 */
export const yahooFields = {
  name: z.string().min(1).max(200),
  symbol: z.string().min(1).max(20),
  quantity: z.number().positive(),
  purchasePrice: z
    .number()
    .positive()
    .describe('Purchase price per share in EUR'),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  assetCategory: assetCategoryField,
};

/**
 * Fields used when creating a custom (fixed-rate) asset. The first movement
 * (amount + date + optional note) is stored as the asset's first
 * contribution in the chosen currency.
 */
export const customCreateFields = {
  name: z.string().min(1).max(200),
  annualReturnRate: z
    .number()
    .min(-1)
    .describe('Annual return rate as a decimal'),
  firstMovementAmount: z
    .number()
    .min(0)
    .describe(
      'First deposit, in the product currency. Stored as the first contribution.',
    ),
  firstMovementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  firstMovementNote: z.string().max(500).optional(),
  currency: z.enum(ASSET_CURRENCIES).optional(),
  assetCategory: assetCategoryField,
};

/**
 * Fields used when updating a custom asset's metadata. Currency is fixed at
 * creation and not updatable here; quantity does not apply to custom
 * assets — the contributions list is the only source of size.
 * Contributions are managed via the dedicated contribution tools.
 */
export const customUpdateFields = {
  name: z.string().min(1).max(200),
  annualReturnRate: z
    .number()
    .min(-1)
    .describe('Annual return rate as a decimal'),
  assetCategory: assetCategoryField,
};

/**
 * Fields used when adding or updating a single contribution.
 */
export const contributionFields = {
  amount: z
    .number()
    .describe(
      'Signed amount in product currency: positive = deposit, negative = withdrawal.',
    ),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  note: z.string().max(500).optional(),
};

/**
 * Wraps an arbitrary value as an MCP text content payload.
 *
 * @param value - JSON-serializable value to return as the tool's text result
 */
export function ok(value: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
  };
}
