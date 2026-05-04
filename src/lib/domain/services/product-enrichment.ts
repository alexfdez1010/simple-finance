/**
 * Enriches financial products with per-product totals in EUR. Centralises
 * the live price fetch (Yahoo) and the multi-contribution compound
 * calculation (Custom) plus currency conversion so every consumer
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
 * Enriches a list of products with their current EUR values and net invested
 * amounts. Yahoo prices are fetched live; custom products are valued from
 * their contributions and converted from product currency to EUR.
 *
 * @param products - Raw products (custom ones include their contributions)
 * @returns Products extended with `currentValue`, `currentValueEur`, `investedEur`
 */
export async function enrichProductsWithEurValues(
  products: FinancialProduct[],
): Promise<ProductWithValue[]> {
  return Promise.all(
    products.map(async (p): Promise<ProductWithValue> => {
      if (p.type === 'YAHOO_FINANCE') {
        const quote = await fetchYahooQuoteServer(p.yahoo.symbol);
        const currentValue = quote?.regularMarketPrice ?? 0;
        const currentValueEur = currentValue * p.quantity;
        const investedEur = p.yahoo.purchasePrice * p.quantity;
        return { ...p, currentValue, currentValueEur, investedEur };
      }

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
      const investedUnitEur = await convertProductAmountToEur(
        netInvestedProductCcy,
        p.custom.currency,
      );

      const currentValueEur = totalEur * p.quantity;
      const investedEur = investedUnitEur * p.quantity;
      const currentValue = p.quantity > 0 ? totalEur : 0;

      return { ...p, currentValue, currentValueEur, investedEur };
    }),
  );
}
