import { describe, expect, it } from 'vitest';
import { computeMonthlyInvestmentGains } from '@/lib/domain/services/monthly-investment-gains';
import { getInvestedSeries } from '@/lib/domain/services/contributions-data';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

const today = '2026-09-21';

/** Builds aligned valuation/cost-basis inputs from compact fixtures, without mutation. */
function calculate(rows: Array<[string, number, number]>, asOf = today) {
  return computeMonthlyInvestmentGains(
    rows.map(([date, value]) => ({ date, value })),
    rows.map(([date, , invested]) => ({ date, invested })),
    asOf,
  );
}

describe('monthly investment gains', () => {
  it('subtracts signed net deposits and withdrawals, preserving losses and flat months', () => {
    expect(
      calculate([
        ['2026-04-30', 1000, 1000],
        ['2026-05-31', 1350, 1300],
        ['2026-06-30', 1100, 1100],
        ['2026-07-31', 1100, 1100],
        ['2026-08-31', 1175, 1100],
      ]),
    ).toEqual([
      {
        month: '2026-05',
        openingValue: 1000,
        closingValue: 1350,
        netContributions: 300,
        gain: 50,
      },
      {
        month: '2026-06',
        openingValue: 1350,
        closingValue: 1100,
        netContributions: -200,
        gain: -50,
      },
      {
        month: '2026-07',
        openingValue: 1100,
        closingValue: 1100,
        netContributions: 0,
        gain: 0,
      },
      {
        month: '2026-08',
        openingValue: 1100,
        closingValue: 1175,
        netContributions: 0,
        gain: 75,
      },
    ]);
  });

  it('does not invent opening balances, missing month closes, or current/future results', () => {
    expect(
      calculate([
        ['2026-04-30', 100, 100],
        ['2026-05-30', 110, 100],
        ['2026-06-30', 120, 100],
        ['2026-08-31', 130, 100],
        ['2026-09-21', 140, 100],
        ['2026-09-30', 150, 100],
        ['2026-10-31', 160, 100],
      ]),
    ).toEqual([]);
    expect(calculate([])).toEqual([]);
  });

  it('handles leap years, year boundaries, unsorted input and zero opening values', () => {
    const rows: Array<[string, number, number]> = [
      ['2024-02-29', 60, 50],
      ['2023-12-31', 0, 0],
      ['2024-01-31', 55, 50],
    ];
    const original = structuredClone(rows);
    expect(calculate(rows).map(({ month, gain }) => ({ month, gain }))).toEqual(
      [
        { month: '2024-01', gain: 5 },
        { month: '2024-02', gain: 5 },
      ],
    );
    expect(rows).toEqual(original);
  });

  it('omits missing cost bases and non-finite inputs instead of treating them as zero', () => {
    expect(
      computeMonthlyInvestmentGains(
        [
          { date: '2026-07-31', value: 100 },
          { date: '2026-08-31', value: 150 },
        ],
        [],
        today,
      ),
    ).toEqual([]);
    expect(
      calculate([
        ['2026-07-31', NaN, 100],
        ['2026-08-31', 150, 100],
      ]),
    ).toEqual([]);
    expect(
      calculate([
        ['2026-07-31', 100, 100],
        ['2026-08-31', 150, Infinity],
      ]),
    ).toEqual([]);
  });

  it('integrates custom signed EUR movements and Yahoo purchases on the correct dates', async () => {
    const products = [
      {
        type: 'CUSTOM',
        custom: {
          contributions: [
            { date: new Date('2026-07-01'), amountEur: 1000 },
            { date: new Date('2026-08-01'), amountEur: 300 },
            { date: new Date('2026-08-31'), amountEur: -100 },
            { date: new Date('2026-09-01'), amountEur: 999 },
          ],
        },
      },
      {
        type: 'YAHOO_FINANCE',
        quantity: 2,
        yahoo: { purchaseDate: new Date('2026-08-15'), purchasePrice: 100 },
      },
    ] as FinancialProduct[];
    const snapshots = [
      { date: '2026-07-31', value: 1050 },
      { date: '2026-08-31', value: 1500 },
    ];
    const invested = await getInvestedSeries(
      products,
      snapshots.map((p) => p.date),
    );
    expect(
      computeMonthlyInvestmentGains(snapshots, invested, today)[0],
    ).toEqual({
      month: '2026-08',
      openingValue: 1050,
      closingValue: 1500,
      netContributions: 400,
      gain: 50,
    });
  });
});
