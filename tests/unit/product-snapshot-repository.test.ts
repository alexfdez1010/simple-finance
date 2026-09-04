/**
 * Unit tests for historical product-snapshot lookup.
 * @module tests/unit/product-snapshot-repository
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));

vi.mock('@/lib/infrastructure/database/prisma-client', () => ({
  prisma: { financialProduct: { findMany } },
}));

import { findFirstProductSnapshots } from '@/lib/infrastructure/database/product-snapshot-repository';

describe('findFirstProductSnapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the earliest selected EUR snapshot for every product', async () => {
    const snapshot = { date: new Date('2025-09-04'), value: 900 };
    findMany.mockResolvedValue([
      { id: 'usd-savings', snapshots: [snapshot] },
      { id: 'without-history', snapshots: [] },
    ]);

    const result = await findFirstProductSnapshots([
      'usd-savings',
      'without-history',
    ]);

    expect(result).toEqual(new Map([['usd-savings', snapshot]]));
    expect(findMany).toHaveBeenCalledWith({
      where: { id: { in: ['usd-savings', 'without-history'] } },
      select: {
        id: true,
        snapshots: {
          orderBy: { date: 'asc' },
          take: 1,
          select: { date: true, value: true },
        },
      },
    });
  });

  it('does not query the database for an empty product list', async () => {
    await expect(findFirstProductSnapshots([])).resolves.toEqual(new Map());
    expect(findMany).not.toHaveBeenCalled();
  });
});
