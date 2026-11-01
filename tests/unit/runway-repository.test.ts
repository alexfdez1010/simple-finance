import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getRunwaySettings,
  saveRunwaySettings,
} from '@/lib/infrastructure/database/runway-repository';

const database = vi.hoisted(() => ({ findUnique: vi.fn(), upsert: vi.fn() }));
vi.mock('@/lib/infrastructure/database/prisma-client', () => ({
  prisma: { runwaySettings: database },
}));

const settings = {
  monthlyExpenses: 2000,
  annualInflation: 0.02,
  monthlyContribution: 300,
};

describe('runway persistence compatibility', () => {
  beforeEach(() => vi.resetAllMocks());

  it('reads active assumptions without exposing retired FIRE controls', async () => {
    database.findUnique.mockResolvedValue(settings);
    expect(await getRunwaySettings()).toEqual(settings);
    expect(database.findUnique).toHaveBeenCalledWith({
      where: { id: 'default' },
      select: {
        monthlyExpenses: true,
        annualInflation: true,
        monthlyContribution: true,
      },
    });
  });

  it('never rewrites retained rollback columns, even with legacy runtime values', async () => {
    const legacySettings = {
      ...settings,
      withdrawalRate: 0.08,
      targetYears: 40,
      monthlyIncome: 500,
      annualReturnOverride: 0.07,
    };
    await saveRunwaySettings(legacySettings);
    expect(database.upsert).toHaveBeenCalledWith({
      where: { id: 'default' },
      create: { id: 'default', ...settings },
      update: settings,
    });
  });
});
