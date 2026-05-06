/**
 * Server actions for product history queries.
 *
 * Snapshots are written by the daily cron in EUR. The dialog augments the
 * series with a live "today" point computed from the current price /
 * contributions so the chart is always up-to-date.
 *
 * For custom products we additionally return:
 *  - `annualReturnRate` and `contributions` (date+amount only) so the client
 *    can simulate forward in the product's own currency, and
 *  - `anchorEurPerProductCcy`, the conversion ratio between the product's
 *    currency and EUR at the latest known point. Future-projection values
 *    are converted with this single anchor — good enough for an indicative
 *    "what could happen" line and avoids quoting future FX rates we do not
 *    have.
 *
 * @module lib/actions/history-actions
 */

'use server';

import { findProductById } from '@/lib/infrastructure/database/product-repository';
import { findProductSnapshots } from '@/lib/infrastructure/database/product-snapshot-repository';
import { fetchYahooQuoteServer } from '@/lib/infrastructure/yahoo-finance/server-client';
import { calculateCustomProductValueFromContributions } from '@/lib/domain/services/custom-product-calculator';
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
  /** Custom-only: needed to project future performance from contributions. */
  custom?: {
    annualReturnRate: number;
    currency: string;
    contributions: Array<{ date: string; amount: number }>;
    /** Multiply product-currency value by this to get an EUR estimate. */
    anchorEurPerProductCcy: number;
  };
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
      const quote = await fetchYahooQuoteServer(product.yahoo.symbol);
      const liveEur = (quote?.regularMarketPrice ?? 0) * product.quantity;
      upsertTodayPoint(series, today, liveEur);
      return { history: series, type: 'YAHOO_FINANCE' };
    }

    const valueProductCcy = calculateCustomProductValueFromContributions(
      product.custom.contributions,
      product.custom.annualReturnRate,
    );
    const liveEur = await convertProductAmountToEur(
      valueProductCcy,
      product.custom.currency,
    );
    upsertTodayPoint(series, today, liveEur);

    const anchor = valueProductCcy > 0 ? liveEur / valueProductCcy : 1;

    return {
      history: series,
      type: 'CUSTOM',
      custom: {
        annualReturnRate: product.custom.annualReturnRate,
        currency: product.custom.currency,
        contributions: product.custom.contributions.map((c) => ({
          date: c.date.toISOString(),
          amount: c.amount,
        })),
        anchorEurPerProductCcy: anchor,
      },
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
