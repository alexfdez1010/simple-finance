import type { FinanceBackup } from '../../src/lib/backup/backup-schema';

/** Creates a fresh deterministic copy containing every persisted record type and nullable legacy fields. */
export function financeBackupFixture(): FinanceBackup {
  const date = '2026-01-02T00:00:00.000Z';
  const audit = { createdAt: date, updatedAt: date };
  return {
    format: 'simple-finance-backup',
    version: 1,
    exportedAt: date,
    preferences: { displayCurrency: 'USD' },
    data: {
      products: [
        {
          ...audit,
          id: 'custom',
          name: 'Savings with a complete movement history',
          type: 'CUSTOM',
          assetCategory: 'CASH',
          quantity: 1,
          daysToLiquidity: 30,
        },
        {
          ...audit,
          id: 'yahoo',
          name: 'Market position',
          type: 'YAHOO_FINANCE',
          assetCategory: 'STOCKS',
          quantity: 2.5,
          daysToLiquidity: 2,
        },
      ],
      yahoo: [
        {
          ...audit,
          id: 'yahoo-data',
          productId: 'yahoo',
          symbol: 'AAPL',
          purchasePrice: 120.125,
          purchaseDate: date,
        },
      ],
      custom: [
        {
          ...audit,
          id: 'custom-data',
          productId: 'custom',
          annualReturnRate: 0.05,
          currency: 'EUR',
        },
      ],
      contributions: [
        {
          ...audit,
          id: 'deposit',
          customProductDataId: 'custom-data',
          amount: 1000.25,
          amountEur: 1000.25,
          date,
          note: 'Initial contribution á €',
        },
        {
          ...audit,
          id: 'withdrawal',
          customProductDataId: 'custom-data',
          amount: -50,
          amountEur: null,
          date,
          note: null,
        },
      ],
      productSnapshots: [
        {
          id: 'snapshot-custom',
          productId: 'custom',
          value: 950.25,
          quantity: 1,
          date,
          createdAt: date,
        },
        {
          id: 'snapshot-yahoo',
          productId: 'yahoo',
          value: 350.125,
          quantity: 2.5,
          date,
          createdAt: date,
        },
      ],
      portfolioSnapshots: [
        {
          id: 'portfolio-old',
          date: '2026-01-01T00:00:00.000Z',
          value: 1200,
          investedEur: null,
          createdAt: date,
        },
        {
          id: 'portfolio',
          date,
          value: 1300.375,
          investedEur: 1250.5625,
          createdAt: date,
        },
      ],
      runwaySettings: [
        {
          id: 'default',
          monthlyExpenses: 2000,
          monthlyIncome: 100,
          annualInflation: 0.02,
          withdrawalRate: 0.035,
          targetYears: 15,
          monthlyContribution: 500,
          annualReturnOverride: null,
          updatedAt: date,
        },
      ],
    },
  };
}
