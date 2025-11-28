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
 * Converts USD to EUR at creation time if needed
 *
 * @param name - Product name
 * @param annualReturnRate - Annual return rate percentage
 * @param initialInvestment - Initial investment amount in original currency
 * @param investmentDate - Date of investment
 * @param quantity - Quantity
 * @param currency - Currency ('EUR' or 'USD')
 * @returns Created product
 */
export async function createCustomProductAction(
  name: string,
  annualReturnRate: number,
  initialInvestment: number,
  investmentDate: Date,
  quantity: number,
  currency: string = 'EUR',
): Promise<{ success: boolean; error?: string; productId?: string }> {
  try {
    // Convert to EUR at creation time if USD
    let initialInvestmentEur = initialInvestment;
    if (currency === 'USD') {
      const { convertToEur } =
        await import('@/lib/domain/services/currency-converter');
      initialInvestmentEur = await convertToEur(initialInvestment);
    }

    const input: CreateCustomProductInput = {
      name,
      annualReturnRate,
      initialInvestment: initialInvestmentEur, // Store in EUR
      investmentDate,
      quantity,
      currency,
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
 * Gets a single product by ID
 *
 * @param productId - Product ID
 * @returns Product or null if not found
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
 * Updates a Yahoo Finance product
 *
 * @param productId - Product ID
 * @param name - Product name
 * @param quantity - Number of shares
 * @param purchasePrice - Purchase price per share in EUR
 * @param purchaseDate - Date of purchase
 * @returns Success status
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
 * Updates a custom product
 * Initial investment is already in EUR (no conversion needed)
 *
 * @param productId - Product ID
 * @param name - Product name
 * @param quantity - Quantity
 * @param annualReturnRate - Annual return rate percentage
 * @param initialInvestment - Initial investment amount (already in EUR)
 * @param investmentDate - Date of investment
 * @param currency - Currency ('EUR' or 'USD')
 * @returns Success status
 */
export async function updateCustomProductAction(
  productId: string,
  name: string,
  quantity: number,
  annualReturnRate: number,
  initialInvestment: number,
  investmentDate: Date,
  currency: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const input: UpdateCustomProductInput = {
      productId,
      name,
      quantity,
      annualReturnRate,
      initialInvestment, // Already in EUR
      investmentDate,
      currency,
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
