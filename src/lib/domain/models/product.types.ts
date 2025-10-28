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
  portfolioId: string;
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
  portfolioId: string;
  name: string;
  symbol: string;
  quantity: number;
}

/**
 * Input for creating a custom product
 */
export interface CreateCustomProductInput {
  portfolioId: string;
  name: string;
  annualReturnRate: number;
  initialInvestment: number;
  investmentDate: Date;
  quantity: number;
}

/**
 * Input for updating product quantity
 */
export interface UpdateProductQuantityInput {
  productId: string;
  quantity: number;
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
