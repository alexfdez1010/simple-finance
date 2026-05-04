/**
 * Enriches financial products with per-product totals in both EUR (for
 * portfolio aggregation) and the product's own currency (for per-product
 * UI). Centralises the live price fetch (Yahoo) and the multi-contribution
 * compound calculation (Custom) plus currency conversion so every consumer
 * (dashboard, cron snapshot, portfolio aggregations) sees the same totals.
 *
 * @module domain/services/product-enrichment
 */

import 'server-only';
import type {
  FinancialProduct,
  ProductWithValue,
} from '@/lib/domain/models/product.types';
import { fetchYahooQuoteServer } from '@/lib/infrastructure/yahoo-finance/server-client';
import {
  calculateCustomProductValueFromContributions,
  calculateNetInvestedFromContributions,
} from './custom-product-calculator';
import { convertProductAmountToEur } from './product-currency-converter';

/**
 * Enriches a list of products with their current values in both EUR and
 * the product's own currency. Yahoo prices are fetched live; custom
 * products are valued from their contributions in the chosen currency and
 * then converted to EUR for portfolio-level aggregation.
 *
 * @param products - Raw products (custom ones include their contributions)
 * @returns Products extended with both EUR and product-currency totals
 */
export async function enrichProductsWithEurValues(
  products: FinancialProduct[],
): Promise<ProductWithValue[]> {
  return Promise.all(
    products.map(async (p): Promise<ProductWithValue> => {
      if (p.type === 'YAHOO_FINANCE') {
        const currentValue =
          (await fetchYahooQuoteServer(p.yahoo.symbol))?.regularMarketPrice ??
          0;
        const currentValueEur = currentValue * p.quantity;
        const investedEur = p.yahoo.purchasePrice * p.quantity;
        return {
          ...p,
          currentValue,
          currentValueEur,
          investedEur,
          currentValueProductCcy: currentValueEur,
          investedProductCcy: investedEur,
        };
      }

      // Custom products no longer use `quantity`; the contributions list is
      // the only source of size, so totals are read directly from it.
      const totalProductCcy = calculateCustomProductValueFromContributions(
        p.custom.contributions,
        p.custom.annualReturnRate,
      );
      const netInvestedProductCcy = calculateNetInvestedFromContributions(
        p.custom.contributions,
      );

      const totalEur = await convertProductAmountToEur(
        totalProductCcy,
        p.custom.currency,
      );
      const investedEur = await convertProductAmountToEur(
        netInvestedProductCcy,
        p.custom.currency,
      );

      const currentValueEur = totalEur;
      const currentValue = totalEur;
      const currentValueProductCcy = totalProductCcy;
      const investedProductCcy = netInvestedProductCcy;

      return {
        ...p,
        currentValue,
        currentValueEur,
        investedEur,
        currentValueProductCcy,
        investedProductCcy,
      };
    }),
  );
}
