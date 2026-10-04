import type { ProductWithValue } from '@/lib/domain/models/product.types';

/**
 * Builds isolated holdings with deliberately different value, gain and name order.
 * @returns New custom and Yahoo holdings; no I/O, dates and amounts are deterministic.
 */
export function createHoldingsFixtures(): ProductWithValue[] {
  const base = {
    assetCategory: 'CASH' as const,
    daysToLiquidity: 0,
    quantity: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    expectedAnnualReturn: null,
  };
  return [
    {
      ...base,
      id: 'reserve',
      type: 'CUSTOM',
      name: 'Zen reserve',
      currentValue: 1200,
      currentValueEur: 1200,
      investedEur: 800,
      custom: {
        id: 'reserve-data',
        currency: 'BTC',
        annualReturnRate: 0,
        contributions: [],
      },
    },
    {
      ...base,
      id: 'shares',
      type: 'YAHOO_FINANCE',
      name: 'Alpha shares',
      currentValue: 3000,
      currentValueEur: 3000,
      investedEur: 2900,
      yahoo: {
        id: 'shares-data',
        symbol: 'AAPL',
        purchasePrice: 2900,
        purchaseDate: new Date('2026-01-01T00:00:00Z'),
      },
    },
    {
      ...base,
      id: 'bonds',
      type: 'CUSTOM',
      name: 'Bond ladder',
      currentValue: 900,
      currentValueEur: 900,
      investedEur: 1200,
      custom: {
        id: 'bonds-data',
        currency: 'EUR',
        annualReturnRate: 0,
        contributions: [],
      },
    },
  ];
}
