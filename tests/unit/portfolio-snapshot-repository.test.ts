/** Compatibility tests for an additive snapshot-capital rollout. */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const database = vi.hoisted(() => ({ findMany: vi.fn(), upsert: vi.fn() }));
vi.mock('@/lib/infrastructure/database/prisma-client', () => ({
  prisma: { portfolioSnapshot: database },
}));
import {
  getPortfolioSnapshotsLastNDays,
  upsertPortfolioSnapshot,
} from '@/lib/infrastructure/database/portfolio-snapshot-repository';

const day = new Date('2026-09-06T00:00:00Z');
const row = { id: 'snapshot', date: day, createdAt: day, value: 1200 };

beforeEach(() => {
  vi.resetAllMocks();
});

describe('snapshot capital persistence', () => {
  it('reads the frozen basis after migration', async () => {
    database.findMany.mockResolvedValue([{ ...row, investedEur: 1000 }]);
    expect((await getPortfolioSnapshotsLastNDays(90))[0].investedEur).toBe(
      1000,
    );
    expect(database.findMany).toHaveBeenCalledTimes(1);
  });

  it('reads legacy rows before migration without selecting the missing column again', async () => {
    database.findMany
      .mockRejectedValueOnce({ code: 'P2022' })
      .mockResolvedValueOnce([row]);
    expect(await getPortfolioSnapshotsLastNDays(90)).toEqual([
      { ...row, investedEur: null },
    ]);
    expect(database.findMany.mock.calls[1][0].select).not.toHaveProperty(
      'investedEur',
    );
  });

  it('writes capital and value together, including on same-day reruns', async () => {
    database.upsert.mockResolvedValue(row);
    await upsertPortfolioSnapshot(day, 1200, 1000);
    expect(database.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { date: day, value: 1200, investedEur: 1000 },
        update: { value: 1200, investedEur: 1000 },
      }),
    );
  });

  it('clears the old captured basis when a legacy caller overwrites the valuation', async () => {
    database.upsert.mockResolvedValue(row);
    await upsertPortfolioSnapshot(day, 1200);
    expect(database.upsert.mock.calls[0][0].update).toEqual({
      value: 1200,
      investedEur: null,
    });
  });

  it('still writes a legacy snapshot before migration and reports pending capture', async () => {
    database.upsert
      .mockRejectedValueOnce({ code: 'P2022' })
      .mockResolvedValueOnce(row);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(await upsertPortfolioSnapshot(day, 1200, 1000)).toEqual(row);
      expect(database.upsert.mock.calls[1][0].update).toEqual({ value: 1200 });
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('needs migration'),
      );
    } finally {
      warn.mockRestore();
    }
  });

  it('propagates connectivity and other failures without attempting legacy fallbacks', async () => {
    const error = new Error('Database unavailable');
    database.findMany.mockRejectedValue(error);
    database.upsert.mockRejectedValue(error);
    await expect(getPortfolioSnapshotsLastNDays(90)).rejects.toBe(error);
    await expect(upsertPortfolioSnapshot(day, 1200, 1000)).rejects.toBe(error);
    expect(database.findMany).toHaveBeenCalledTimes(1);
    expect(database.upsert).toHaveBeenCalledTimes(1);
  });
});
