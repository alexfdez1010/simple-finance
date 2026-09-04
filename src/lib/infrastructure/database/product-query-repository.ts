/** Query, update, and delete repository operations for financial products. */

import { prisma } from './prisma-client';
import { mapCustomData } from './product-mappers';
import type {
  CustomProduct,
  FinancialProduct,
  UpdateCustomProductInput,
  UpdateProductQuantityInput,
  UpdateYahooFinanceProductInput,
  YahooFinanceProduct,
} from '@/lib/domain/models/product.types';

/** Finds one product with its type-specific data, or null. */
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
    return { ...product, type: 'YAHOO_FINANCE', yahoo: product.yahoo };
  }
  if (product.type === 'CUSTOM' && product.custom) {
    return {
      ...product,
      type: 'CUSTOM',
      custom: mapCustomData(product.custom),
    };
  }
  return null;
}

/** Returns all products with embedded contributions, newest first. */
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
      return { ...product, type: 'YAHOO_FINANCE', yahoo: product.yahoo };
    }
    return {
      ...product,
      type: 'CUSTOM',
      custom: mapCustomData(product.custom!),
    };
  });
}

/** Updates quantity and returns the refreshed product. */
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

/** Updates a Yahoo Finance product and returns it. */
export async function updateYahooFinanceProduct(
  input: UpdateYahooFinanceProductInput,
): Promise<YahooFinanceProduct> {
  const product = await prisma.financialProduct.update({
    where: { id: input.productId },
    data: {
      name: input.name,
      quantity: input.quantity,
      assetCategory: input.assetCategory,
      daysToLiquidity: input.daysToLiquidity,
      yahoo: {
        update: {
          purchasePrice: input.purchasePrice,
          purchaseDate: input.purchaseDate,
        },
      },
    },
    include: { yahoo: true },
  });
  return { ...product, type: 'YAHOO_FINANCE', yahoo: product.yahoo! };
}

/** Updates custom metadata without reinterpreting its fixed currency. */
export async function updateCustomProduct(
  input: UpdateCustomProductInput,
): Promise<CustomProduct> {
  await prisma.financialProduct.update({
    where: { id: input.productId },
    data: {
      name: input.name,
      quantity: 1,
      assetCategory: input.assetCategory,
      daysToLiquidity: input.daysToLiquidity,
      custom: { update: { annualReturnRate: input.annualReturnRate } },
    },
  });
  const product = await findProductById(input.productId);
  if (!product || product.type !== 'CUSTOM') {
    throw new Error('Custom product not found after update');
  }
  return product;
}

/** Deletes a product and its cascaded type-specific records. */
export async function deleteProduct(productId: string): Promise<void> {
  await prisma.financialProduct.delete({ where: { id: productId } });
}
