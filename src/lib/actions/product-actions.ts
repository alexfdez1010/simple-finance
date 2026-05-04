/**
 * Server actions for product operations
 * @module lib/actions/product-actions
 */

'use server';

import { revalidatePath } from 'next/cache';
import {
  createYahooFinanceProduct,
  createCustomProduct,
  findAllProducts,
  findProductById,
  updateProductQuantity,
  updateYahooFinanceProduct,
  updateCustomProduct,
  deleteProduct,
} from '@/lib/infrastructure/database/product-repository';
import {
  fetchYahooQuoteServer,
  type YahooQuote,
} from '@/lib/infrastructure/yahoo-finance/server-client';
import type {
  CreateYahooFinanceProductInput,
  CreateCustomProductInput,
  UpdateYahooFinanceProductInput,
  UpdateCustomProductInput,
  FinancialProduct,
} from '@/lib/domain/models/product.types';

const DEFAULT_CURRENCY = 'EUR';

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
): Promise<{ success: boolean; error?: string; productId?: string }> {
  try {
    const input: CreateYahooFinanceProductInput = {
      name,
      symbol: symbol.toUpperCase(),
      quantity,
      purchasePrice,
      purchaseDate,
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
 * Creates a custom product. The initial investment is stored as-is in the
 * product's currency — no EUR conversion is performed; the dashboard
 * converts at display time. The amount is persisted as the first
 * contribution so the create flow and the contributions list stay in sync.
 *
 * @param name - Product name
 * @param annualReturnRate - Annual return rate as decimal (0.05 = 5%)
 * @param initialInvestment - Initial deposit in `currency`
 * @param investmentDate - Date of initial contribution
 * @param quantity - Quantity (usually 1 for custom products)
 * @param currency - Product currency (default EUR)
 * @param initialNote - Optional note attached to the first movement
 * @returns Created product id or error
 */
export async function createCustomProductAction(
  name: string,
  annualReturnRate: number,
  initialInvestment: number,
  investmentDate: Date,
  quantity: number,
  currency: string = DEFAULT_CURRENCY,
  initialNote?: string | null,
): Promise<{ success: boolean; error?: string; productId?: string }> {
  try {
    const input: CreateCustomProductInput = {
      name,
      annualReturnRate,
      initialInvestment,
      investmentDate,
      quantity,
      currency: currency || DEFAULT_CURRENCY,
      initialNote,
    };

    const product = await createCustomProduct(input);

    revalidatePath('/dashboard');
    return { success: true, productId: product.id };
  } catch (error) {
    console.error('Failed to create custom product:', error);
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
): Promise<{ success: boolean; error?: string }> {
  try {
    const input: UpdateYahooFinanceProductInput = {
      productId,
      name,
      quantity,
      purchasePrice,
      purchaseDate,
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
 * Updates a custom product's metadata. Contributions are managed via the
 * dedicated contribution actions.
 */
export async function updateCustomProductAction(
  productId: string,
  name: string,
  quantity: number,
  annualReturnRate: number,
  currency: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const input: UpdateCustomProductInput = {
      productId,
      name,
      quantity,
      annualReturnRate,
      currency: currency || DEFAULT_CURRENCY,
    };

    await updateCustomProduct(input);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to update custom product:', error);
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
