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
  updateProductQuantity,
  deleteProduct,
} from '@/lib/infrastructure/database/product-repository';
import {
  fetchYahooQuoteServer,
  type YahooQuote,
} from '@/lib/infrastructure/yahoo-finance/server-client';
import type {
  CreateYahooFinanceProductInput,
  CreateCustomProductInput,
  FinancialProduct,
} from '@/lib/domain/models/product.types';

/**
 * Creates a Yahoo Finance product
 *
 * @param name - Product name
 * @param symbol - Stock symbol
 * @param quantity - Number of shares
 * @param purchasePrice - Purchase price per share in EUR
 * @param purchaseDate - Date of purchase
 * @returns Created product
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
 * Creates a custom product
 *
 * @param name - Product name
 * @param annualReturnRate - Annual return rate percentage
 * @param initialInvestment - Initial investment amount
 * @param investmentDate - Date of investment
 * @param quantity - Quantity
 * @returns Created product
 */
export async function createCustomProductAction(
  name: string,
  annualReturnRate: number,
  initialInvestment: number,
  investmentDate: Date,
  quantity: number,
): Promise<{ success: boolean; error?: string; productId?: string }> {
  try {
    const input: CreateCustomProductInput = {
      name,
      annualReturnRate,
      initialInvestment,
      investmentDate,
      quantity,
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
 * Gets all products for the default portfolio
 *
 * @returns Array of products
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
 * Updates product quantity
 *
 * @param productId - Product ID
 * @param quantity - New quantity
 * @returns Success status
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
 * Deletes a product
 *
 * @param productId - Product ID
 * @returns Success status
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
 * Validates a Yahoo Finance symbol by fetching quote data
 *
 * @param symbol - Stock symbol to validate
 * @returns Quote data if valid, null if invalid
 */
export async function validateYahooSymbol(
  symbol: string,
): Promise<YahooQuote | null> {
  return await fetchYahooQuoteServer(symbol);
}
