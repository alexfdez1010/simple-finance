/**
 * Server-side aggregations over contribution events that power the
 * dashboard's contribution-driven charts. Custom-product contributions
 * are converted from their product currency to EUR (current rate) so the
 * dashboard can present everything in the user's display currency without
 * doing async work on the client. Yahoo-Finance products are treated as
 * a single deposit on their `purchaseDate`.
 *
 * @module domain/services/contributions-data
 */

import 'server-only';
import type { FinancialProduct } from '@/lib/domain/models/product.types';
import { convertProductAmountToEur } from './product-currency-converter';

/** A signed deposit/withdrawal event already converted to EUR. */
export interface ContributionEvent {
  date: string;
  amountEur: number;
  source: 'YAHOO_FINANCE' | 'CUSTOM';
}

/** Net deposits/withdrawals aggregated for one calendar month. */
export interface MonthlyContribution {
  month: string;
  deposits: number;
  withdrawals: number;
  net: number;
}

/** Cumulative cost basis at each portfolio-snapshot date. */
export interface InvestedSeriesPoint {
  date: string;
  invested: number;
}

/** Custom-only contribution events used by the monthly chart. */
async function customEvents(
  products: FinancialProduct[],
): Promise<ContributionEvent[]> {
  const out: ContributionEvent[] = [];
  for (const p of products) {
    if (p.type !== 'CUSTOM') continue;
    for (const c of p.custom.contributions) {
      const amountEur = await convertProductAmountToEur(
        c.amount,
        p.custom.currency,
      );
      out.push({
        date: c.date.toISOString().slice(0, 10),
        amountEur,
        source: 'CUSTOM',
      });
    }
  }
  return out;
}

/** All contribution events (Yahoo + Custom) for cost-basis history. */
async function allEvents(
  products: FinancialProduct[],
): Promise<ContributionEvent[]> {
  const out = await customEvents(products);
  for (const p of products) {
    if (p.type !== 'YAHOO_FINANCE') continue;
    out.push({
      date: p.yahoo.purchaseDate.toISOString().slice(0, 10),
      amountEur: p.yahoo.purchasePrice * p.quantity,
      source: 'YAHOO_FINANCE',
    });
  }
  return out;
}

/**
 * Aggregates custom-product contribution events into per-month totals
 * (EUR), separating deposits from withdrawals so a diverging bar chart
 * can render both signs side-by-side.
 *
 * @param products - Raw products (custom ones include their contributions)
 * @returns Sorted array of monthly aggregates (oldest → newest)
 */
export async function getMonthlyContributions(
  products: FinancialProduct[],
): Promise<MonthlyContribution[]> {
  const events = await customEvents(products);
  const map = new Map<string, MonthlyContribution>();
  for (const e of events) {
    const month = e.date.slice(0, 7);
    const row = map.get(month) ?? {
      month,
      deposits: 0,
      withdrawals: 0,
      net: 0,
    };
    if (e.amountEur >= 0) row.deposits += e.amountEur;
    else row.withdrawals += e.amountEur;
    row.net += e.amountEur;
    map.set(month, row);
  }
  return Array.from(map.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );
}

/**
 * Builds a cumulative-invested series aligned to a list of evolution
 * dates, so an "invested vs value" chart can plot cost basis against
 * portfolio value on the same X-axis without client-side async work.
 *
 * @param products - Raw products (custom + yahoo)
 * @param dates - Sorted ISO dates from the evolution series
 * @returns Cumulative-invested point per date
 */
export async function getInvestedSeries(
  products: FinancialProduct[],
  dates: string[],
): Promise<InvestedSeriesPoint[]> {
  const events = (await allEvents(products)).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const out: InvestedSeriesPoint[] = [];
  let cursor = 0;
  let cumulative = 0;
  for (const date of dates) {
    while (cursor < events.length && events[cursor].date <= date) {
      cumulative += events[cursor].amountEur;
      cursor += 1;
    }
    out.push({ date, invested: cumulative });
  }
  return out;
}
