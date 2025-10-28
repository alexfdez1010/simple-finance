/**
 * Repository for financial product data access
 * @module infrastructure/database/product-repository
 */

import { prisma } from './prisma-client';
import type {
  FinancialProduct,
  YahooFinanceProduct,
  CustomProduct,
  CreateYahooFinanceProductInput,
  CreateCustomProductInput,
  UpdateProductQuantityInput,
  ProductSnapshot,
} from '@/lib/domain/models/product.types';

/**
 * Creates a Yahoo Finance product
 *
 * @param input - Product creation data
 * @returns Created product
 */
export async function createYahooFinanceProduct(
  input: CreateYahooFinanceProductInput,
): Promise<YahooFinanceProduct> {
  const product = await prisma.financialProduct.create({
    data: {
      portfolioId: input.portfolioId,
      type: 'YAHOO_FINANCE',
      name: input.name,
      quantity: input.quantity,
      yahoo: {
        create: {
          symbol: input.symbol,
        },
      },
    },
    include: {
      yahoo: true,
    },
  });

  return {
    ...product,
    type: 'YAHOO_FINANCE',
    yahoo: product.yahoo!,
  } as YahooFinanceProduct;
}

/**
 * Creates a custom product
 *
 * @param input - Product creation data
 * @returns Created product
 */
export async function createCustomProduct(
  input: CreateCustomProductInput,
): Promise<CustomProduct> {
  const product = await prisma.financialProduct.create({
    data: {
      portfolioId: input.portfolioId,
      type: 'CUSTOM',
      name: input.name,
      quantity: input.quantity,
      custom: {
        create: {
          annualReturnRate: input.annualReturnRate,
          initialInvestment: input.initialInvestment,
          investmentDate: input.investmentDate,
        },
      },
    },
    include: {
      custom: true,
    },
  });

  return {
    ...product,
    type: 'CUSTOM',
    custom: product.custom!,
  } as CustomProduct;
}

/**
 * Finds a product by ID
 *
 * @param productId - Product ID
 * @returns Product or null if not found
 */
export async function findProductById(
  productId: string,
): Promise<FinancialProduct | null> {
  const product = await prisma.financialProduct.findUnique({
    where: { id: productId },
    include: {
      yahoo: true,
      custom: true,
    },
  });

  if (!product) {
    return null;
  }

  if (product.type === 'YAHOO_FINANCE' && product.yahoo) {
    return {
      ...product,
      type: 'YAHOO_FINANCE',
      yahoo: product.yahoo,
    } as YahooFinanceProduct;
  }

  if (product.type === 'CUSTOM' && product.custom) {
    return {
      ...product,
      type: 'CUSTOM',
      custom: product.custom,
    } as CustomProduct;
  }

  return null;
}

/**
 * Finds all products in a portfolio
 *
 * @param portfolioId - Portfolio ID
 * @returns Array of products
 */
export async function findProductsByPortfolioId(
  portfolioId: string,
): Promise<FinancialProduct[]> {
  const products = await prisma.financialProduct.findMany({
    where: { portfolioId },
    include: {
      yahoo: true,
      custom: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return products.map((product: (typeof products)[0]): FinancialProduct => {
    if (product.type === 'YAHOO_FINANCE' && product.yahoo) {
      return {
        ...product,
        type: 'YAHOO_FINANCE',
        yahoo: product.yahoo,
      } as YahooFinanceProduct;
    }
    return {
      ...product,
      type: 'CUSTOM',
      custom: product.custom!,
    } as CustomProduct;
  });
}

/**
 * Updates product quantity
 *
 * @param input - Update data
 * @returns Updated product
 */
export async function updateProductQuantity(
  input: UpdateProductQuantityInput,
): Promise<FinancialProduct> {
  const product = await prisma.financialProduct.update({
    where: { id: input.productId },
    data: { quantity: input.quantity },
    include: {
      yahoo: true,
      custom: true,
    },
  });

  if (product.type === 'YAHOO_FINANCE' && product.yahoo) {
    return {
      ...product,
      type: 'YAHOO_FINANCE',
      yahoo: product.yahoo,
    } as YahooFinanceProduct;
  }

  return {
    ...product,
    type: 'CUSTOM',
    custom: product.custom!,
  } as CustomProduct;
}

/**
 * Deletes a product
 *
 * @param productId - Product ID
 */
export async function deleteProduct(productId: string): Promise<void> {
  await prisma.financialProduct.delete({
    where: { id: productId },
  });
}

/**
 * Creates a product snapshot
 *
 * @param productId - Product ID
 * @param date - Snapshot date
 * @param value - Product value
 * @param quantity - Product quantity
 * @returns Created snapshot
 */
export async function createProductSnapshot(
  productId: string,
  date: Date,
  value: number,
  quantity: number,
): Promise<ProductSnapshot> {
  return await prisma.productSnapshot.create({
    data: {
      productId,
      date,
      value,
      quantity,
    },
  });
}

/**
 * Finds snapshots for a product within a date range
 *
 * @param productId - Product ID
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of snapshots
 */
export async function findProductSnapshots(
  productId: string,
  startDate: Date,
  endDate: Date,
): Promise<ProductSnapshot[]> {
  return await prisma.productSnapshot.findMany({
    where: {
      productId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
  });
}
