import { prisma } from './prisma-client';

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
    orderBy: {
      date: 'desc',
    },
  });
}

/**
 * Gets portfolio snapshots for the last N days.
 *
 * @param days - Number of days to retrieve
 * @returns Array of snapshots ordered by date ascending
 */
export async function getPortfolioSnapshotsLastNDays(
  days: number,
): Promise<Array<{ id: string; date: Date; value: number }>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await prisma.portfolioSnapshot.findMany({
    where: {
      date: {
        gte: startDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });
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
 * Updates or creates a portfolio snapshot for a given date.
 *
 * @param date - The date of the snapshot
 * @param value - The total portfolio value in EUR
 * @returns The created or updated snapshot
 */
export async function upsertPortfolioSnapshot(
  date: Date,
  value: number,
): Promise<{ id: string; date: Date; value: number }> {
  return await prisma.portfolioSnapshot.upsert({
    where: {
      date,
    },
    update: {
      value,
    },
    create: {
      date,
      value,
    },
  });
}
