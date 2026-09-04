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
import {
  fetchYahooQuoteServer,
  type YahooQuote,
} from '@/lib/infrastructure/yahoo-finance/server-client';
import { getYahooExpectedReturn } from '@/lib/infrastructure/yahoo-finance/expected-return-client';
import { getCurrencyExpectedReturnVsEur } from '@/lib/infrastructure/currency/currency-history-client';
import { calculateCustomProductValueFromContributions } from './custom-product-calculator';
import { combineExpectedReturn } from './custom-expected-return';
import { calculateCustomReturnBasisEur } from './custom-return-basis';
import { ensureContributionEurAmounts } from './contribution-eur-backfill';
import { convertProductAmountToEur } from './product-currency-converter';

export interface ProductEnrichmentOptions {
  fetchYahooQuote?: (symbol: string) => Promise<YahooQuote | null>;
  failOnMissingYahooQuote?: boolean;
}

/** Error raised when a strict valuation cannot obtain a Yahoo quote. */
export class YahooQuoteUnavailableError extends Error {
  /** Creates an error identifying the product and symbol that could not load. */
  constructor(
    public readonly productId: string,
    public readonly symbol: string,
  ) {
    super(`Yahoo quote unavailable for ${symbol}`);
    this.name = 'YahooQuoteUnavailableError';
  }
}

/**
 * Enriches a list of products with their current values in EUR. Yahoo
 * prices are fetched live; custom products are valued from their
 * contributions in the chosen currency and then converted to EUR for
 * portfolio-level aggregation. Their return basis is the sum of each signed
 * contribution's date-specific EUR value, filled once for legacy rows. This
 * retains FX gains or losses without treating deposits as profit.
 *
 * @param products - Raw products (custom ones include their contributions)
 * @param options - Quote loader and strictness policy for the caller
 * @returns Products extended with EUR totals
 * @throws YahooQuoteUnavailableError in strict mode when a quote is missing
 */
export async function enrichProductsWithEurValues(
  products: FinancialProduct[],
  options: ProductEnrichmentOptions = {},
): Promise<ProductWithValue[]> {
  const valuationDate = new Date();
  const productsWithEurBasis = await ensureContributionEurAmounts(products);
  const fetchQuote = options.fetchYahooQuote ?? fetchYahooQuoteServer;

  return Promise.all(
    productsWithEurBasis.map(async (p): Promise<ProductWithValue> => {
      if (p.type === 'YAHOO_FINANCE') {
        const [quote, expectedAnnualReturn] = await Promise.all([
          fetchQuote(p.yahoo.symbol),
          getYahooExpectedReturn(p.yahoo.symbol),
        ]);
        if (!quote && options.failOnMissingYahooQuote) {
          throw new YahooQuoteUnavailableError(p.id, p.yahoo.symbol);
        }
        const currentValue = quote?.regularMarketPrice ?? 0;
        const currentValueEur = currentValue * p.quantity;
        const investedEur = p.yahoo.purchasePrice * p.quantity;
        return {
          ...p,
          currentValue,
          currentValueEur,
          investedEur,
          expectedAnnualReturn,
        };
      }

      // Custom products are sized by their contributions list — quantity
      // does not apply, so totals come straight from it.
      const totalProductCcy = calculateCustomProductValueFromContributions(
        p.custom.contributions,
        p.custom.annualReturnRate,
        valuationDate,
      );
      const [currentValueEur, fxGeomean] = await Promise.all([
        convertProductAmountToEur(totalProductCcy, p.custom.currency),
        getCurrencyExpectedReturnVsEur(p.custom.currency),
      ]);
      const investedEur = calculateCustomReturnBasisEur(
        p.custom.contributions,
        valuationDate,
      );

      return {
        ...p,
        currentValue: currentValueEur,
        currentValueEur,
        investedEur,
        expectedAnnualReturn: combineExpectedReturn(
          p.custom.annualReturnRate,
          fxGeomean,
        ),
      };
    }),
  );
}
