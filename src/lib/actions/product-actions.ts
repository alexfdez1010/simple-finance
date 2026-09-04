/**
 * Server actions for product operations
 * @module lib/actions/product-actions
 */

'use server';

import { revalidatePath } from 'next/cache';
import {
  createYahooFinanceProduct,
  findAllProducts,
  findProductById,
  updateProductQuantity,
  updateYahooFinanceProduct,
  deleteProduct,
} from '@/lib/infrastructure/database/product-repository';
import {
  fetchYahooQuoteServer,
  type YahooQuote,
} from '@/lib/infrastructure/yahoo-finance/server-client';
import type {
  CreateYahooFinanceProductInput,
  UpdateYahooFinanceProductInput,
  FinancialProduct,
} from '@/lib/domain/models/product.types';
import {
  DEFAULT_ASSET_CATEGORY,
  type AssetCategory,
} from '@/lib/domain/models/asset-category';

const DEFAULT_DAYS_TO_LIQUIDITY = 0;

/**
 * Creates a Yahoo Finance product.
 *
 * @param name - Product name
 * @param symbol - Stock symbol
 * @param quantity - Number of shares
 * @param purchasePrice - Purchase price per share in EUR
 * @param purchaseDate - Date of purchase
 * @returns Created product id or error
 */
export async function createYahooProduct(
  name: string,
  symbol: string,
  quantity: number,
  purchasePrice: number,
  purchaseDate: Date,
  assetCategory: AssetCategory = DEFAULT_ASSET_CATEGORY,
  daysToLiquidity: number = DEFAULT_DAYS_TO_LIQUIDITY,
): Promise<{ success: boolean; error?: string; productId?: string }> {
  try {
    const input: CreateYahooFinanceProductInput = {
      name,
      symbol: symbol.toUpperCase(),
      quantity,
      purchasePrice,
      purchaseDate,
      assetCategory,
      daysToLiquidity,
    };

    const product = await createYahooFinanceProduct(input);

    revalidatePath('/dashboard');
    return { success: true, productId: product.id };
  } catch (error) {
    console.error('Failed to create Yahoo Finance product:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}

/**
 * Gets all products in the portfolio.
 */
export async function getProducts(): Promise<FinancialProduct[]> {
  try {
    return await findAllProducts();
  } catch (error) {
    console.error('Failed to get products:', error);
    return [];
  }
}

/**
 * Updates product quantity.
 */
export async function updateProductQuantityAction(
  productId: string,
  quantity: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateProductQuantity({ productId, quantity });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to update product quantity:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update quantity',
    };
  }
}

/**
 * Deletes a product.
 */
export async function deleteProductAction(
  productId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteProduct(productId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete product:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete product',
    };
  }
}

/**
 * Gets a single product by id.
 */
export async function getProduct(
  productId: string,
): Promise<FinancialProduct | null> {
  try {
    return await findProductById(productId);
  } catch (error) {
    console.error('Failed to get product:', error);
    return null;
  }
}

/**
 * Updates a Yahoo Finance product.
 */
export async function updateYahooProductAction(
  productId: string,
  name: string,
  quantity: number,
  purchasePrice: number,
  purchaseDate: Date,
  assetCategory: AssetCategory = DEFAULT_ASSET_CATEGORY,
  daysToLiquidity: number = DEFAULT_DAYS_TO_LIQUIDITY,
): Promise<{ success: boolean; error?: string }> {
  try {
    const input: UpdateYahooFinanceProductInput = {
      productId,
      name,
      quantity,
      purchasePrice,
      purchaseDate,
      assetCategory,
      daysToLiquidity,
    };

    await updateYahooFinanceProduct(input);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to update Yahoo Finance product:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update product',
    };
  }
}

/**
 * Validates a Yahoo Finance symbol by fetching quote data.
 */
export async function validateYahooSymbol(
  symbol: string,
): Promise<YahooQuote | null> {
  return await fetchYahooQuoteServer(symbol);
}
