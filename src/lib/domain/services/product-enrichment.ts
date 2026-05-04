/**
 * Enriches financial products with per-product totals in EUR for portfolio
 * aggregation and dashboard display. Centralises the live price fetch
 * (Yahoo) and the multi-contribution compound calculation (Custom) plus
 * currency conversion so every consumer (dashboard, cron snapshot,
 * portfolio aggregations) sees the same totals.
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
 * Enriches a list of products with their current values in EUR. Yahoo
 * prices are fetched live; custom products are valued from their
 * contributions in the chosen currency and then converted to EUR for
 * portfolio-level aggregation and per-card rendering (which uses the
 * dashboard's display-currency selector).
 *
 * @param products - Raw products (custom ones include their contributions)
 * @returns Products extended with EUR totals
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
        return { ...p, currentValue, currentValueEur, investedEur };
      }

      // Custom products are sized by their contributions list — quantity
      // does not apply, so totals come straight from it.
      const totalProductCcy = calculateCustomProductValueFromContributions(
        p.custom.contributions,
        p.custom.annualReturnRate,
      );
      const netInvestedProductCcy = calculateNetInvestedFromContributions(
        p.custom.contributions,
      );

      const currentValueEur = await convertProductAmountToEur(
        totalProductCcy,
        p.custom.currency,
      );
      const investedEur = await convertProductAmountToEur(
        netInvestedProductCcy,
        p.custom.currency,
      );

      return {
        ...p,
        currentValue: currentValueEur,
        currentValueEur,
        investedEur,
      };
    }),
  );
}
