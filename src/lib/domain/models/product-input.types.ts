/** Write-side contracts for financial products and contributions. */

import type { AssetCategory } from './asset-category';

/** Input for creating a Yahoo Finance product. */
export interface CreateYahooFinanceProductInput {
  name: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  assetCategory: AssetCategory;
  daysToLiquidity: number;
}

/** Input for creating a custom product with a frozen first EUR movement. */
export interface CreateCustomProductInput {
  name: string;
  annualReturnRate: number;
  currency: string;
  assetCategory: AssetCategory;
  daysToLiquidity: number;
  firstMovement: {
    amount: number;
    amountEur: number;
    date: Date;
    note?: string | null;
  };
}

/** Input for updating product quantity. */
export interface UpdateProductQuantityInput {
  productId: string;
  quantity: number;
}

/** Input for updating a Yahoo Finance product. */
export interface UpdateYahooFinanceProductInput {
  productId: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  assetCategory: AssetCategory;
  daysToLiquidity: number;
}

/** Input for updating custom-product metadata, excluding its fixed currency. */
export interface UpdateCustomProductInput {
  productId: string;
  name: string;
  annualReturnRate: number;
  assetCategory: AssetCategory;
  daysToLiquidity: number;
}

/** Persistence input for a contribution with its immutable EUR basis. */
export interface AddContributionInput {
  customProductDataId: string;
  amount: number;
  amountEur: number;
  date: Date;
  note?: string | null;
}

/** Persistence input for replacing a contribution and its EUR basis. */
export interface UpdateContributionInput {
  id: string;
  amount: number;
  amountEur: number;
  date: Date;
  note?: string | null;
}
