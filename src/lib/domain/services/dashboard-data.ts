/**
 * Computes derived dashboard data from products and daily changes
 * @module lib/domain/services/dashboard-data
 */

import type { ProductWithValue } from '@/lib/domain/models/product.types';
import type { AssetCategory } from '@/lib/domain/models/asset-category';

interface AllocationItem {
  name: string;
  value: number;
  type: 'YAHOO_FINANCE' | 'CUSTOM';
}

interface CategoryAllocationItem {
  category: AssetCategory;
  value: number;
}

interface PerformerItem {
  name: string;
  symbol: string;
  returnPct: number;
  returnValue: number;
  type: 'YAHOO_FINANCE' | 'CUSTOM';
}

interface CurrencyAllocationItem {
  currency: string;
  value: number;
}

interface DashboardData {
  stats: { totalValue: number; totalInvestment: number; productCount: number };
  allocationData: AllocationItem[];
  performersData: PerformerItem[];
  currencyAllocation: CurrencyAllocationItem[];
  categoryAllocation: CategoryAllocationItem[];
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

  const currencyMap = new Map<string, number>();
  for (const p of products) {
    const ccy =
      p.type === 'CUSTOM' ? (p.custom.currency || 'EUR').toUpperCase() : 'EUR';
    currencyMap.set(ccy, (currencyMap.get(ccy) ?? 0) + p.currentValueEur);
  }
  const currencyAllocation = Array.from(currencyMap.entries())
    .map(([currency, value]) => ({ currency, value }))
    .sort((a, b) => b.value - a.value);

  const categoryMap = new Map<AssetCategory, number>();
  for (const p of products) {
    categoryMap.set(
      p.assetCategory,
      (categoryMap.get(p.assetCategory) ?? 0) + p.currentValueEur,
    );
  }
  const categoryAllocation = Array.from(categoryMap.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  return {
    stats,
    allocationData,
    performersData,
    currencyAllocation,
    categoryAllocation,
    dailyChange,
  };
}
