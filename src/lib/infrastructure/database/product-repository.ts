/**
 * Repository for financial product data access
 * @module infrastructure/database/product-repository
 */

import { prisma } from './prisma-client';
import { mapCustomData } from './product-mappers';
import type {
  FinancialProduct,
  YahooFinanceProduct,
  CustomProduct,
  CreateYahooFinanceProductInput,
  CreateCustomProductInput,
  UpdateProductQuantityInput,
  UpdateYahooFinanceProductInput,
  UpdateCustomProductInput,
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
      type: 'YAHOO_FINANCE',
      name: input.name,
      quantity: input.quantity,
      yahoo: {
        create: {
          symbol: input.symbol,
          purchasePrice: input.purchasePrice,
          purchaseDate: input.purchaseDate,
        },
      },
    },
    include: { yahoo: true },
  });

  return {
    ...product,
    type: 'YAHOO_FINANCE',
    yahoo: product.yahoo!,
  } as YahooFinanceProduct;
}

/**
 * Creates a custom product whose initial deposit is persisted as the first
 * contribution in the product's currency (no EUR conversion). Legacy
 * `initialInvestment`/`investmentDate` mirror that first contribution for
 * backwards compatibility with old snapshots and reports.
 *
 * @param input - Product creation data; `initialInvestment` is in `currency`
 * @returns Created product
 */
export async function createCustomProduct(
  input: CreateCustomProductInput,
): Promise<CustomProduct> {
  const note = input.initialNote?.trim() || 'First movement';
  const product = await prisma.financialProduct.create({
    data: {
      type: 'CUSTOM',
      name: input.name,
      quantity: input.quantity,
      custom: {
        create: {
          annualReturnRate: input.annualReturnRate,
          initialInvestment: input.initialInvestment,
          investmentDate: input.investmentDate,
          currency: input.currency,
          contributions: {
            create: {
              amount: input.initialInvestment,
              date: input.investmentDate,
              note,
            },
          },
        },
      },
    },
    include: { custom: { include: { contributions: true } } },
  });

  return {
    ...product,
    type: 'CUSTOM',
    custom: mapCustomData(product.custom!),
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
      custom: { include: { contributions: true } },
    },
  });

  if (!product) return null;

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
      custom: mapCustomData(product.custom),
    } as CustomProduct;
  }

  return null;
}

/**
 * Finds all products in the portfolio.
 *
 * @returns Array of products with embedded contributions for custom ones
 */
export async function findAllProducts(): Promise<FinancialProduct[]> {
  const products = await prisma.financialProduct.findMany({
    include: {
      yahoo: true,
      custom: { include: { contributions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return products.map((product): FinancialProduct => {
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
      custom: mapCustomData(product.custom!),
    } as CustomProduct;
  });
}

/**
 * Updates product quantity.
 */
export async function updateProductQuantity(
  input: UpdateProductQuantityInput,
): Promise<FinancialProduct> {
  await prisma.financialProduct.update({
    where: { id: input.productId },
    data: { quantity: input.quantity },
  });
  const product = await findProductById(input.productId);
  if (!product) throw new Error('Product not found after update');
  return product;
}

/**
 * Updates a Yahoo Finance product.
 */
export async function updateYahooFinanceProduct(
  input: UpdateYahooFinanceProductInput,
): Promise<YahooFinanceProduct> {
  const product = await prisma.financialProduct.update({
    where: { id: input.productId },
    data: {
      name: input.name,
      quantity: input.quantity,
      yahoo: {
        update: {
          purchasePrice: input.purchasePrice,
          purchaseDate: input.purchaseDate,
        },
      },
    },
    include: { yahoo: true },
  });

  return {
    ...product,
    type: 'YAHOO_FINANCE',
    yahoo: product.yahoo!,
  } as YahooFinanceProduct;
}

/**
 * Updates a custom product's metadata (name, quantity, rate, currency).
 * Contributions are managed via contribution-repository.
 */
export async function updateCustomProduct(
  input: UpdateCustomProductInput,
): Promise<CustomProduct> {
  await prisma.financialProduct.update({
    where: { id: input.productId },
    data: {
      name: input.name,
      quantity: input.quantity,
      custom: {
        update: {
          annualReturnRate: input.annualReturnRate,
          currency: input.currency,
        },
      },
    },
  });
  const product = await findProductById(input.productId);
  if (!product || product.type !== 'CUSTOM') {
    throw new Error('Custom product not found after update');
  }
  return product;
}

/**
 * Deletes a product (cascade removes its custom data and contributions).
 */
export async function deleteProduct(productId: string): Promise<void> {
  await prisma.financialProduct.delete({ where: { id: productId } });
}
