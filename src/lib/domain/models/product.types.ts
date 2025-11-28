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
 * Custom product with fixed annual return rate
 */
export interface CustomProduct extends BaseProduct {
  type: 'CUSTOM';
  custom: {
    id: string;
    annualReturnRate: number;
    initialInvestment: number;
    investmentDate: Date;
    currency: string; // 'EUR' or 'USD'
  };
}

/**
 * Union type for all product types
 */
export type FinancialProduct = YahooFinanceProduct | CustomProduct;

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
 * Input for creating a custom product
 */
export interface CreateCustomProductInput {
  name: string;
  annualReturnRate: number;
  initialInvestment: number;
  investmentDate: Date;
  quantity: number;
  currency: string; // 'EUR' or 'USD'
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
 * Input for updating a custom product
 */
export interface UpdateCustomProductInput {
  productId: string;
  name: string;
  quantity: number;
  annualReturnRate: number;
  initialInvestment: number;
  investmentDate: Date;
  currency: string; // 'EUR' or 'USD'
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
