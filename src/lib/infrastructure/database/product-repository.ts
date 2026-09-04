/**
 * Repository for financial product data access
 * @module infrastructure/database/product-repository
 */

import { prisma } from './prisma-client';
import { mapCustomData } from './product-mappers';
import type {
  YahooFinanceProduct,
  CustomProduct,
  CreateYahooFinanceProductInput,
  CreateCustomProductInput,
} from '@/lib/domain/models/product.types';

export {
  deleteProduct,
  findAllProducts,
  findProductById,
  updateCustomProduct,
  updateProductQuantity,
  updateYahooFinanceProduct,
} from './product-query-repository';

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
      assetCategory: input.assetCategory,
      daysToLiquidity: input.daysToLiquidity,
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
 * Creates a custom product whose first movement is persisted as a single
 * contribution in the chosen currency. There is no separate
 * "initial investment" snapshot — the contributions table is the only
 * source of truth for amounts.
 *
 * @param input - Product creation data
 * @returns Created product
 */
export async function createCustomProduct(
  input: CreateCustomProductInput,
): Promise<CustomProduct> {
  const note = input.firstMovement.note?.trim() || 'First movement';
  const product = await prisma.financialProduct.create({
    data: {
      type: 'CUSTOM',
      assetCategory: input.assetCategory,
      daysToLiquidity: input.daysToLiquidity,
      name: input.name,
      quantity: 1,
      custom: {
        create: {
          annualReturnRate: input.annualReturnRate,
          currency: input.currency,
          contributions: {
            create: {
              amount: input.firstMovement.amount,
              amountEur: input.firstMovement.amountEur,
              date: input.firstMovement.date,
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
