import { getDatabase } from '@/lib/cloudflare/context';
import { findProductById } from './product-query-repository';
import type {
  CustomProduct,
  UpdateCustomProductInput,
  UpdateYahooFinanceProductInput,
  YahooFinanceProduct,
} from '@/lib/domain/models/product.types';

/** Atomically updates the holding and Yahoo detail; missing or mismatched products are rejected. */
export async function updateYahooFinanceProduct(
  input: UpdateYahooFinanceProductInput,
): Promise<YahooFinanceProduct> {
  const existing = await findProductById(input.productId);
  if (existing?.type !== 'YAHOO_FINANCE')
    throw new Error('Yahoo product not found');
  const db = getDatabase();
  const now = new Date().toISOString().replace('Z', '+00:00');
  await db.batch([
    db
      .prepare(
        'UPDATE financial_products SET name=?, quantity=?, assetCategory=?, daysToLiquidity=?, updatedAt=? WHERE id=?',
      )
      .bind(
        input.name,
        input.quantity,
        input.assetCategory,
        input.daysToLiquidity,
        now,
        input.productId,
      ),
    db
      .prepare(
        'UPDATE yahoo_finance_data SET purchasePrice=?, purchaseDate=?, updatedAt=? WHERE productId=?',
      )
      .bind(
        input.purchasePrice,
        input.purchaseDate.toISOString().replace('Z', '+00:00'),
        now,
        input.productId,
      ),
  ]);
  const product = await findProductById(input.productId);
  if (product?.type !== 'YAHOO_FINANCE')
    throw new Error('Product not found after update');
  return product;
}

/** Updates custom metadata atomically without changing its currency or contributions. */
export async function updateCustomProduct(
  input: UpdateCustomProductInput,
): Promise<CustomProduct> {
  const existing = await findProductById(input.productId);
  if (existing?.type !== 'CUSTOM') throw new Error('Custom product not found');
  const db = getDatabase();
  const now = new Date().toISOString().replace('Z', '+00:00');
  await db.batch([
    db
      .prepare(
        'UPDATE financial_products SET name=?, quantity=1, assetCategory=?, daysToLiquidity=?, updatedAt=? WHERE id=?',
      )
      .bind(
        input.name,
        input.assetCategory,
        input.daysToLiquidity,
        now,
        input.productId,
      ),
    db
      .prepare(
        'UPDATE custom_product_data SET annualReturnRate=?, reinvestInterest=?, updatedAt=? WHERE productId=?',
      )
      .bind(
        input.annualReturnRate,
        Number(input.reinvestInterest ?? existing.custom.reinvestInterest),
        now,
        input.productId,
      ),
  ]);
  const product = await findProductById(input.productId);
  if (product?.type !== 'CUSTOM')
    throw new Error('Custom product not found after update');
  return product;
}
