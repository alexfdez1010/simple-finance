/**
 * Shared input schemas and helpers for MCP asset tools.
 * @module lib/mcp/tools/shared
 */

import { z } from 'zod';

export const ASSET_CURRENCIES = ['EUR', 'USD', 'BTC', 'ETH', 'XAUT'] as const;

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
};

/**
 * Fields used when creating a custom (fixed-rate) asset. Includes the
 * initial deposit, which becomes the asset's first contribution.
 */
export const customCreateFields = {
  name: z.string().min(1).max(200),
  quantity: z.number().positive(),
  annualReturnRate: z
    .number()
    .min(-1)
    .describe('Annual return rate as a decimal'),
  initialInvestment: z
    .number()
    .min(0)
    .describe(
      'Initial deposit, in the product currency. Stored as the first contribution.',
    ),
  investmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  currency: z.enum(ASSET_CURRENCIES).optional(),
};

/**
 * Fields used when updating a custom asset's metadata. Contributions are
 * managed via the dedicated contribution tools.
 */
export const customUpdateFields = {
  name: z.string().min(1).max(200),
  quantity: z.number().positive(),
  annualReturnRate: z
    .number()
    .min(-1)
    .describe('Annual return rate as a decimal'),
  currency: z.enum(ASSET_CURRENCIES).optional(),
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
