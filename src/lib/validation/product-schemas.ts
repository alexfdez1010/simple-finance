/**
 * Zod validation schemas for product API requests
 * @module validation/product-schemas
 */

import { z } from 'zod';
import { ASSET_CATEGORIES } from '@/lib/domain/models/asset-category';

const assetCategorySchema = z.enum(
  ASSET_CATEGORIES as unknown as [string, ...string[]],
);

/**
 * Schema for creating a Yahoo Finance product
 */
export const createYahooFinanceProductSchema = z.object({
  portfolioId: z.string().min(1, 'Portfolio ID is required'),
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  symbol: z.string().min(1, 'Symbol is required').max(10, 'Symbol too long'),
  quantity: z.number().positive('Quantity must be positive'),
  assetCategory: assetCategorySchema,
});

/**
 * Schema for creating a custom product. The first movement (amount + date)
 * is stored as a contribution in the chosen currency.
 */
export const createCustomProductSchema = z.object({
  portfolioId: z.string().min(1, 'Portfolio ID is required'),
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  annualReturnRate: z.number().min(-1, 'Return rate cannot be less than -100%'),
  firstMovementAmount: z.number().min(0, 'First movement cannot be negative'),
  firstMovementDate: z.coerce.date(),
  assetCategory: assetCategorySchema,
});

/**
 * Schema for updating product quantity
 */
export const updateProductQuantitySchema = z.object({
  quantity: z.number().positive('Quantity must be positive'),
});

/**
 * Schema for product ID parameter
 */
export const productIdSchema = z.string().min(1, 'Product ID is required');

/**
 * Type inference from schemas
 */
export type CreateYahooFinanceProductDTO = z.infer<
  typeof createYahooFinanceProductSchema
>;
export type CreateCustomProductDTO = z.infer<typeof createCustomProductSchema>;
export type UpdateProductQuantityDTO = z.infer<
  typeof updateProductQuantitySchema
>;
