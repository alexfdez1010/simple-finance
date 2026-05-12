/**
 * Server actions for product history queries.
 *
 * Snapshots are written by the daily cron in EUR. The dialog augments the
 * series with a live "today" point computed from the current price /
 * contributions so the chart is always up-to-date.
 *
 * Forward projections are driven by a single `expectedAnnualReturn` (EUR
 * decimal): Yahoo's 5y geomean for stocks, the yield+FX-geomean compound
 * for custom products (see `custom-expected-return`).
 *
 * @module lib/actions/history-actions
 */

'use server';

import { findProductById } from '@/lib/infrastructure/database/product-repository';
import { findProductSnapshots } from '@/lib/infrastructure/database/product-snapshot-repository';
import { fetchYahooQuoteServer } from '@/lib/infrastructure/yahoo-finance/server-client';
import { getYahooExpectedReturn } from '@/lib/infrastructure/yahoo-finance/expected-return-client';
import { getCurrencyExpectedReturnVsEur } from '@/lib/infrastructure/currency/currency-history-client';
import { calculateCustomProductValueFromContributions } from '@/lib/domain/services/custom-product-calculator';
import { combineExpectedReturn } from '@/lib/domain/services/custom-expected-return';
import { convertProductAmountToEur } from '@/lib/domain/services/product-currency-converter';

export interface HistoryPoint {
  /** ISO yyyy-mm-dd */
  date: string;
  /** Value in EUR */
  value: number;
}

export interface ProductHistoryResult {
  history: HistoryPoint[];
  type: 'YAHOO_FINANCE' | 'CUSTOM';
  /**
   * Annual expected return as decimal (0.07 = 7%). Yahoo: 5y geomean of
   * monthly closes. Custom: contractual yield compounded with the 5y FX
   * geomean vs EUR. `null` when the source data is too thin.
   */
  expectedAnnualReturn: number | null;
}

function todayKey(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns the per-day EUR value series for a single product, augmented with
 * a live "today" point and (for custom products) the metadata required to
 * simulate a future-performance curve on the client.
 *
 * @param productId - Product id
 * @returns Series + simulation metadata, or null when the product is gone
 */
export async function getProductHistoryAction(
  productId: string,
): Promise<ProductHistoryResult | null> {
  try {
    const product = await findProductById(productId);
    if (!product) return null;

    const snapshots = await findProductSnapshots(productId);
    const series: HistoryPoint[] = snapshots.map((s) => ({
      date: s.date.toISOString().slice(0, 10),
      value: s.value,
    }));

    const today = todayKey();

    if (product.type === 'YAHOO_FINANCE') {
      const [quote, expectedAnnualReturn] = await Promise.all([
        fetchYahooQuoteServer(product.yahoo.symbol),
        getYahooExpectedReturn(product.yahoo.symbol),
      ]);
      const liveEur = (quote?.regularMarketPrice ?? 0) * product.quantity;
      upsertTodayPoint(series, today, liveEur);
      return {
        history: series,
        type: 'YAHOO_FINANCE',
        expectedAnnualReturn,
      };
    }

    const valueProductCcy = calculateCustomProductValueFromContributions(
      product.custom.contributions,
      product.custom.annualReturnRate,
    );
    const [liveEur, fxGeomean] = await Promise.all([
      convertProductAmountToEur(valueProductCcy, product.custom.currency),
      getCurrencyExpectedReturnVsEur(product.custom.currency),
    ]);
    upsertTodayPoint(series, today, liveEur);

    return {
      history: series,
      type: 'CUSTOM',
      expectedAnnualReturn: combineExpectedReturn(
        product.custom.annualReturnRate,
        fxGeomean,
      ),
    };
  } catch (error) {
    console.error('Failed to load product history:', error);
    return null;
  }
}

function upsertTodayPoint(
  series: HistoryPoint[],
  today: string,
  liveEur: number,
): void {
  const last = series[series.length - 1];
  if (last && last.date === today) {
    last.value = liveEur;
    return;
  }
  series.push({ date: today, value: liveEur });
}
