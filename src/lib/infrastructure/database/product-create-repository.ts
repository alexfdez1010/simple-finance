import { randomUUID } from 'node:crypto';
import { getDatabase } from '@/lib/cloudflare/context';
import { findProductById } from './product-query-repository';
import type {
  CreateCustomProductInput,
  CreateYahooFinanceProductInput,
  CustomProduct,
  YahooFinanceProduct,
} from '@/lib/domain/models/product.types';

type ProductTable =
  | 'financial_products'
  | 'yahoo_finance_data'
  | 'custom_product_data'
  | 'custom_product_contributions';

/** Binds an internal, typed product row; values from forms never become SQL identifiers. */
function insert(
  db: D1Database,
  table: ProductTable,
  row: Record<string, string | number | null>,
) {
  const columns = Object.keys(row);
  return db
    .prepare(
      `INSERT INTO "${table}" (${columns.map((key) => `"${key}"`).join(',')}) VALUES (${columns.map(() => '?').join(',')})`,
    )
    .bind(...Object.values(row));
}

/** Creates a holding and its Yahoo detail atomically; returns the persisted product or throws. */
export async function createYahooFinanceProduct(
  input: CreateYahooFinanceProductInput,
): Promise<YahooFinanceProduct> {
  const db = getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString().replace('Z', '+00:00');
  await db.batch([
    insert(db, 'financial_products', {
      id,
      type: 'YAHOO_FINANCE',
      name: input.name,
      quantity: input.quantity,
      assetCategory: input.assetCategory,
      daysToLiquidity: input.daysToLiquidity,
      createdAt: now,
      updatedAt: now,
    }),
    insert(db, 'yahoo_finance_data', {
      id: randomUUID(),
      productId: id,
      symbol: input.symbol,
      purchasePrice: input.purchasePrice,
      purchaseDate: input.purchaseDate.toISOString().replace('Z', '+00:00'),
      createdAt: now,
      updatedAt: now,
    }),
  ]);
  const product = await findProductById(id);
  if (product?.type !== 'YAHOO_FINANCE')
    throw new Error('Product not found after creation');
  return product;
}

/** Creates a custom holding, detail and first contribution in one D1 batch; failure leaves no partial product. */
export async function createCustomProduct(
  input: CreateCustomProductInput,
): Promise<CustomProduct> {
  const db = getDatabase();
  const id = randomUUID();
  const customId = randomUUID();
  const now = new Date().toISOString().replace('Z', '+00:00');
  await db.batch([
    insert(db, 'financial_products', {
      id,
      type: 'CUSTOM',
      name: input.name,
      quantity: 1,
      assetCategory: input.assetCategory,
      daysToLiquidity: input.daysToLiquidity,
      createdAt: now,
      updatedAt: now,
    }),
    insert(db, 'custom_product_data', {
      id: customId,
      productId: id,
      annualReturnRate: input.annualReturnRate,
      reinvestInterest: Number(input.reinvestInterest ?? true),
      currency: input.currency,
      createdAt: now,
      updatedAt: now,
    }),
    insert(db, 'custom_product_contributions', {
      id: randomUUID(),
      customProductDataId: customId,
      amount: input.firstMovement.amount,
      amountEur: input.firstMovement.amountEur,
      date: input.firstMovement.date.toISOString().replace('Z', '+00:00'),
      note: input.firstMovement.note?.trim() || 'First movement',
      createdAt: now,
      updatedAt: now,
    }),
  ]);
  const product = await findProductById(id);
  if (product?.type !== 'CUSTOM')
    throw new Error('Product not found after creation');
  return product;
}
