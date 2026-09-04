/**
 * Domain types for financial products
 * @module domain/models/product.types
 */

import type { AssetCategory } from './asset-category';

export type {
  AddContributionInput,
  CreateCustomProductInput,
  CreateYahooFinanceProductInput,
  UpdateContributionInput,
  UpdateCustomProductInput,
  UpdateProductQuantityInput,
  UpdateYahooFinanceProductInput,
} from './product-input.types';

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
  assetCategory: AssetCategory;
  /** Days needed to convert this asset to cash (liquidity horizon). */
  daysToLiquidity: number;
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
 * `amount` is stored in the parent product's currency. `amountEur` is the
 * signed value frozen at the movement date and is nullable only while a
 * legacy row awaits its idempotent backfill.
 */
export interface CustomContribution {
  id: string;
  amount: number;
  amountEur: number | null;
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
 * Product enriched with per-product totals in EUR. The dashboard, cron
 * snapshot, and aggregations all consume this enriched shape so they do
 * not need to perform per-currency conversion themselves. Per-product
 * native currency is preserved on the underlying CustomProduct and only
 * matters when adding or removing contributions inside the edit dialog.
 *
 * - `currentValue`: per-unit value (Yahoo: live price in EUR; Custom: total
 *   EUR value of all contributions).
 * - `currentValueEur`: total current value in EUR (Yahoo: price·quantity;
 *   Custom: full compounded portfolio of contributions).
 * - `investedEur`: EUR basis used for return calculations. Yahoo products
 *   use purchasePrice·quantity. Custom products sum the signed EUR value
 *   frozen on every contribution date, including later deposits/withdrawals.
 * - `expectedAnnualReturn`: forward-looking annualised return as a decimal
 *   (0.07 = 7%). For Yahoo products this is the geometric mean of the last
 *   five years of monthly closes; for custom products it is the contractual
 *   `annualReturnRate` compounded with the 5-year geometric-mean appreciation
 *   of the product currency against EUR (see `custom-expected-return`).
 *   `null` when unknown (e.g. Yahoo lookup failed or the series is too thin).
 */
export type ProductWithValue = FinancialProduct & {
  currentValue: number;
  currentValueEur: number;
  investedEur: number;
  expectedAnnualReturn: number | null;
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
