import { prisma } from './prisma-client';

const snapshotSelect = { id: true, date: true, value: true } as const;
const legacySelect = { ...snapshotSelect, createdAt: true } as const;

/**
 * Detects an unapplied additive migration without hiding other database errors.
 * @param error - Unknown Prisma failure from a snapshot query.
 * @returns Whether a referenced column is missing; no side effects.
 */
function isMissingColumn(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2022'
  );
}

/** Stored valuation and the capital captured alongside it; legacy bases are null. */
export interface PortfolioSnapshotPoint {
  id: string;
  date: Date;
  value: number;
  createdAt: Date;
  investedEur: number | null;
}

/**
 * Creates a new portfolio snapshot for a given date.
 *
 * @param date - The date of the snapshot
 * @param value - The total portfolio value in EUR
 * @returns The created snapshot
 */
export async function createPortfolioSnapshot(
  date: Date,
  value: number,
): Promise<{ id: string; date: Date; value: number }> {
  return await prisma.portfolioSnapshot.create({
    select: snapshotSelect,
    data: {
      date,
      value,
    },
  });
}

/**
 * Gets the most recent portfolio snapshot.
 *
 * @returns The most recent snapshot or null if none exist
 */
export async function getLatestPortfolioSnapshot(): Promise<{
  id: string;
  date: Date;
  value: number;
} | null> {
  return await prisma.portfolioSnapshot.findFirst({
    select: snapshotSelect,
    orderBy: {
      date: 'desc',
    },
  });
}

/**
 * Gets portfolio snapshots for the last N days.
 *
 * @param days - Number of days to retrieve
 * @returns Ascending snapshots; before migration, missing capital is returned as null.
 */
export async function getPortfolioSnapshotsLastNDays(
  days: number,
): Promise<PortfolioSnapshotPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const query = {
    where: { date: { gte: startDate } },
    orderBy: { date: 'asc' as const },
  };
  try {
    return await prisma.portfolioSnapshot.findMany({
      ...query,
      select: { ...legacySelect, investedEur: true },
    });
  } catch (error) {
    if (!isMissingColumn(error)) throw error;
    const rows = await prisma.portfolioSnapshot.findMany({
      ...query,
      select: legacySelect,
    });
    return rows.map((row) => ({ ...row, investedEur: null }));
  }
}

/**
 * Checks if a snapshot exists for a given date.
 *
 * @param date - The date to check
 * @returns True if snapshot exists, false otherwise
 */
export async function snapshotExistsForDate(date: Date): Promise<boolean> {
  const count = await prisma.portfolioSnapshot.count({
    where: {
      date,
    },
  });
  return count > 0;
}

/**
 * Updates or creates a portfolio snapshot with its matching invested capital.
 *
 * @param date - The date of the snapshot
 * @param value - The total portfolio value in EUR
 * @param investedEur - Capital from the same valuation; omitted legacy writes clear it.
 * @returns The row, writing value and capital atomically when the migration is present.
 * Before migration, persists a legacy snapshot and logs that capture is pending.
 */
export async function upsertPortfolioSnapshot(
  date: Date,
  value: number,
  investedEur: number | null = null,
): Promise<{ id: string; date: Date; value: number }> {
  try {
    return await prisma.portfolioSnapshot.upsert({
      where: { date },
      select: snapshotSelect,
      update: { value, investedEur },
      create: { date, value, investedEur },
    });
  } catch (error) {
    if (!isMissingColumn(error)) throw error;
    console.warn(
      'Snapshot capital capture needs migration 20260906160000_capture_snapshot_invested_eur',
    );
    return await prisma.portfolioSnapshot.upsert({
      where: { date },
      select: snapshotSelect,
      update: { value },
      create: { date, value },
    });
  }
}
