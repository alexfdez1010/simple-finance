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
import { getYahooExpectedReturn } from '@/lib/infrastructure/yahoo-finance/expected-return-client';
import { getCurrencyExpectedReturnVsEur } from '@/lib/infrastructure/currency/currency-history-client';
import { findFirstProductSnapshots } from '@/lib/infrastructure/database/product-snapshot-repository';
import {
  calculateCustomProductValueFromContributions,
  calculateNetInvestedFromContributions,
} from './custom-product-calculator';
import { combineExpectedReturn } from './custom-expected-return';
import { calculateCustomReturnBasisEur } from './custom-return-basis';
import {
  convertProductAmountToEur,
  convertProductAmountToEurAtDate,
} from './product-currency-converter';

/**
 * Enriches a list of products with their current values in EUR. Yahoo
 * prices are fetched live; custom products are valued from their
 * contributions in the chosen currency and then converted to EUR for
 * portfolio-level aggregation. Their return basis is the first stored EUR
 * snapshot adjusted by later cash flows at their historical EUR rates. This
 * retains FX gains or losses without treating deposits as profit; before that
 * snapshot exists, the current EUR conversion of net contributions is used.
 *
 * @param products - Raw products (custom ones include their contributions)
 * @returns Products extended with EUR totals
 */
export async function enrichProductsWithEurValues(
  products: FinancialProduct[],
): Promise<ProductWithValue[]> {
  const valuationDate = new Date();
  const firstSnapshotsPromise = findFirstProductSnapshots(
    products.filter((product) => product.type === 'CUSTOM').map(({ id }) => id),
  );

  return Promise.all(
    products.map(async (p): Promise<ProductWithValue> => {
      if (p.type === 'YAHOO_FINANCE') {
        const [quote, expectedAnnualReturn] = await Promise.all([
          fetchYahooQuoteServer(p.yahoo.symbol),
          getYahooExpectedReturn(p.yahoo.symbol),
        ]);
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
      const netInvestedProductCcy = calculateNetInvestedFromContributions(
        p.custom.contributions,
      );

      const [currentValueEur, fxGeomean, firstSnapshots] = await Promise.all([
        convertProductAmountToEur(totalProductCcy, p.custom.currency),
        getCurrencyExpectedReturnVsEur(p.custom.currency),
        firstSnapshotsPromise,
      ]);
      const firstSnapshot = firstSnapshots.get(p.id);
      const investedEur = firstSnapshot
        ? await calculateCustomReturnBasisEur(
            firstSnapshot,
            p.custom.contributions,
            p.custom.currency,
            valuationDate,
            convertProductAmountToEurAtDate,
          )
        : await convertProductAmountToEur(
            netInvestedProductCcy,
            p.custom.currency,
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
