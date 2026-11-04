import { describe, expect, it } from 'vitest';
import { computeRunwayProjection } from '@/lib/domain/services/runway-projection';
import { simulateYahooFuture } from '@/lib/domain/services/simulate-yahoo-future';
import { createRunwayGrowth } from '@/lib/domain/services/runway-growth';
import { backupDataSchema } from '@/lib/backup/record-schemas';
import { financeBackupFixture } from '../fixtures/finance-backup';

const holding = {
  currentValueEur: 1200,
  expectedAnnualReturn: 100 / 1200,
  simpleInterest: { principalEur: 1000, annualRate: 0.1, fxAnnualRate: 0 },
};
const settings = {
  monthlyExpenses: 0,
  monthlyContribution: 0,
  annualInflation: 0,
};

describe('reinvestment across projections and backups', () => {
  it('keeps accrued interest out of runway and accumulation returns', () => {
    const projection = computeRunwayProjection([holding], settings);
    expect(projection.firstMonthReturn).toBeCloseTo(100 / 12);
    expect(projection.runwayPoints[24].balance).toBeCloseTo(1400);
    expect(projection.wealthPoints[12].balance).toBeCloseTo(1300);
  });
  it('keeps simple and compound holdings separate in mixed portfolios', () => {
    const growth = createRunwayGrowth([
      holding,
      { currentValueEur: 1000, expectedAnnualReturn: 0.12 },
    ]);
    let balance = 2200;
    for (let month = 0; month < 24; month++) balance += growth(balance);
    expect(balance).toBeCloseTo(1400 + 1000 * 1.12 ** 2);
  });
  it('withdraws proportionally and gives new contributions their own principal', () => {
    const growth = createRunwayGrowth([holding]);
    const first = growth(1200);
    const second = growth((1200 + first) / 2);
    expect(second).toBeCloseTo(first / 2);
    const third = growth((1200 + first) / 2 + second + 600);
    expect(third).toBeCloseTo(second + 5);
  });
  it('projects simple interest and currency growth independently in history', () => {
    const points = simulateYahooFuture(
      1200,
      0.1,
      2,
      new Date('2026-01-01'),
      holding.simpleInterest,
    );
    const last = points.at(-1)!;
    expect(last.value).toBeCloseTo(1200 + (100 * 720) / 365);
    const fx = simulateYahooFuture(1200, 0.1, 2, new Date('2026-01-01'), {
      ...holding.simpleInterest,
      fxAnnualRate: 0.05,
    });
    expect(fx.at(-1)!.value).toBeCloseTo(last.value * 1.05 ** (720 / 365));
  });
  it('defaults legacy backups to reinvestment and preserves false', () => {
    const data = financeBackupFixture().data;
    const legacy = JSON.parse(JSON.stringify(data));
    delete legacy.custom[0].reinvestInterest;
    expect(backupDataSchema.parse(legacy).custom[0].reinvestInterest).toBe(
      true,
    );
    data.custom[0].reinvestInterest = false;
    expect(backupDataSchema.parse(data).custom[0].reinvestInterest).toBe(false);
  });
});

it('does not claim FIRE from growing accrued interest when income stays below costs', () => {
  const result = computeRunwayProjection([holding], {
    ...settings,
    monthlyExpenses: 10,
  });
  expect(result.monthlyFireIncome).toBeCloseTo(100 / 12);
  expect(result.projectedFireMonth).toBeNull();
  expect(result.wealthPoints[600].balance).toBeCloseTo(6200);
});
