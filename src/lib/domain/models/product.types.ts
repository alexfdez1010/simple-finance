/**
 * Domain types for financial products
 * @module domain/models/product.types
 */

/**
 * Product type enumeration
 */
export type ProductType = 'YAHOO_FINANCE' | 'CUSTOM';

/**
 * Base financial product interface
 */
export interface BaseProduct {
  id: string;
  type: ProductType;
  name: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Yahoo Finance product with symbol tracking
 */
export interface YahooFinanceProduct extends BaseProduct {
  type: 'YAHOO_FINANCE';
  yahoo: {
    id: string;
    symbol: string;
    purchasePrice: number; // Purchase price per share in EUR
    purchaseDate: Date; // Date of purchase
  };
}

/**
 * Single deposit (positive) or withdrawal (negative) on a custom product.
 * `amount` is stored in the parent product's currency; conversion to a
 * common currency (e.g. EUR for portfolio aggregation) is done at runtime
 * by the consumer.
 */
export interface CustomContribution {
  id: string;
  amount: number;
  date: Date;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Custom product with fixed annual return rate.
 * Value is computed as the sum of compound-interest growth of every
 * contribution from its own date. The product's `currency` is the
 * single source of truth for every contribution amount — currency is
 * set on creation and treated as immutable thereafter so existing
 * amounts cannot be silently reinterpreted.
 */
export interface CustomProduct extends BaseProduct {
  type: 'CUSTOM';
  custom: {
    id: string;
    annualReturnRate: number;
    currency: string; // 'EUR' | 'USD' | 'BTC' | 'ETH' | 'XAUT'
    contributions: CustomContribution[];
  };
}

/**
 * Union type for all product types
 */
export type FinancialProduct = YahooFinanceProduct | CustomProduct;

/**
 * Product enriched with per-product totals. The dashboard, cron snapshot,
 * and aggregations all consume this enriched shape so they do not need to
 * perform per-currency conversion themselves.
 *
 * - `currentValue`: per-unit value (Yahoo: live price in EUR; Custom: total
 *   EUR value of all contributions divided by `quantity`).
 * - `currentValueEur`: total current value in EUR (Yahoo: price·quantity;
 *   Custom: full compounded portfolio of contributions).
 * - `investedEur`: total net invested in EUR (Yahoo: purchasePrice·quantity;
 *   Custom: signed sum of contributions converted to EUR).
 * - `currentValueProductCcy` / `investedProductCcy`: same totals but in the
 *   product's own currency. For Yahoo products this is the same as the EUR
 *   value (purchasePrice / live price are stored in EUR). For Custom
 *   products this is the sum of contributions and their compounded value
 *   in the chosen currency — never converted to EUR. UI surfaces such as
 *   the per-product card use these so the displayed numbers match what the
 *   user typed when adding the contribution.
 */
export type ProductWithValue = FinancialProduct & {
  currentValue: number;
  currentValueEur: number;
  investedEur: number;
  currentValueProductCcy: number;
  investedProductCcy: number;
};

/**
 * Product snapshot representing value at a specific date
 */
export interface ProductSnapshot {
  id: string;
  productId: string;
  date: Date;
  value: number;
  quantity: number;
  createdAt: Date;
}

/**
 * Portfolio containing multiple financial products
 */
export interface Portfolio {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  products?: FinancialProduct[];
}

/**
 * Input for creating a Yahoo Finance product
 */
export interface CreateYahooFinanceProductInput {
  name: string;
  symbol: string;
  quantity: number;
  purchasePrice: number; // Purchase price per share in EUR
  purchaseDate: Date; // Date of purchase
}

/**
 * Input for creating a custom product. The first movement (amount + date
 * + optional note) is persisted as the product's first contribution in
 * the chosen currency — there is no separate "initial investment" stored
 * on the product itself.
 */
export interface CreateCustomProductInput {
  name: string;
  annualReturnRate: number;
  quantity: number;
  currency: string;
  firstMovement: {
    amount: number;
    date: Date;
    note?: string | null;
  };
}

/**
 * Input for updating product quantity
 */
export interface UpdateProductQuantityInput {
  productId: string;
  quantity: number;
}

/**
 * Input for updating a Yahoo Finance product
 */
export interface UpdateYahooFinanceProductInput {
  productId: string;
  name: string;
  quantity: number;
  purchasePrice: number; // Purchase price per share in EUR
  purchaseDate: Date; // Date of purchase
}

/**
 * Input for updating a custom product's metadata
 * (does not modify contributions — use the contribution actions for that).
 * Currency is intentionally absent: it is fixed at creation time so the
 * stored contribution amounts cannot be reinterpreted under a different
 * currency without an explicit data migration.
 */
export interface UpdateCustomProductInput {
  productId: string;
  name: string;
  quantity: number;
  annualReturnRate: number;
}

/**
 * Input for adding a contribution (deposit or withdrawal).
 */
export interface AddContributionInput {
  customProductDataId: string;
  amount: number;
  date: Date;
  note?: string | null;
}

/**
 * Input for updating an existing contribution.
 */
export interface UpdateContributionInput {
  id: string;
  amount: number;
  date: Date;
  note?: string | null;
}

/**
 * Portfolio statistics
 */
export interface PortfolioStatistics {
  totalValue: number;
  totalInvestment: number;
  totalReturn: number;
  totalReturnPercentage: number;
  dailyChange: number;
  dailyChangePercentage: number;
  productCount: number;
}

/**
 * Daily portfolio value for charting
 */
export interface DailyPortfolioValue {
  date: Date;
  value: number;
  products: {
    productId: string;
    name: string;
    value: number;
  }[];
}
