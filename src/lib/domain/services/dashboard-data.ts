/**
 * Computes derived dashboard data from products and daily changes
 * @module lib/domain/services/dashboard-data
 */

import type { ProductWithValue } from '@/lib/domain/models/product.types';

interface AllocationItem {
  name: string;
  value: number;
  type: 'YAHOO_FINANCE' | 'CUSTOM';
}

interface PerformerItem {
  name: string;
  symbol: string;
  returnPct: number;
  returnValue: number;
  type: 'YAHOO_FINANCE' | 'CUSTOM';
}

interface DashboardData {
  stats: { totalValue: number; totalInvestment: number; productCount: number };
  allocationData: AllocationItem[];
  performersData: PerformerItem[];
  dailyChange: number;
}

/**
 * Computes portfolio stats, allocation, performers, and daily change
 *
 * @param products - Products with current values
 * @param dailyChanges - Daily change data from snapshots
 * @returns Computed dashboard data
 */
export function computeDashboardData(
  products: ProductWithValue[],
  dailyChanges: Array<{ date: string; change: number }>,
): DashboardData {
  const stats = products.reduce(
    (acc, p) => {
      acc.totalValue += p.currentValueEur;
      acc.totalInvestment += p.investedEur;
      acc.productCount += 1;
      return acc;
    },
    { totalValue: 0, totalInvestment: 0, productCount: 0 },
  );

  const allocationData = products.map((p) => ({
    name: p.name,
    value: p.currentValueEur,
    type: p.type,
  }));

  const performersData = products.map((p) => {
    const invested = p.investedEur;
    const current = p.currentValueEur;
    const ret = current - invested;
    return {
      name: p.name,
      symbol: p.type === 'YAHOO_FINANCE' ? p.yahoo.symbol : 'Custom',
      returnPct: invested > 0 ? (ret / invested) * 100 : 0,
      returnValue: ret,
      type: p.type,
    };
  });

  const dailyChange =
    dailyChanges.length > 0 ? dailyChanges[dailyChanges.length - 1].change : 0;

  return { stats, allocationData, performersData, dailyChange };
}
