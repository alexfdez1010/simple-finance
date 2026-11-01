import 'server-only';
import type { RunwaySettings } from '@/lib/domain/models/runway.types';
import { prisma } from './prisma-client';

const SETTINGS_ID = 'default';
const assumptions = {
  monthlyExpenses: true,
  annualInflation: true,
  monthlyContribution: true,
} as const;

/**
 * Reads the app's shared simulation assumptions from PostgreSQL.
 * @returns EUR amounts and decimal rates, or null until the first successful save.
 * Performs one read; connection failures propagate to the route's error boundary.
 */
export async function getRunwaySettings(): Promise<RunwaySettings | null> {
  return prisma.runwaySettings.findUnique({
    where: { id: SETTINGS_ID },
    select: assumptions,
  });
}

/**
 * Atomically creates or replaces the shared simulation assumptions.
 * @param settings - Validated EUR amounts and decimal annual rates.
 * @returns Nothing after persistence; database errors propagate without partial writes.
 * Updates only the singleton settings row, preserving all holdings and snapshots.
 */
export async function saveRunwaySettings(
  settings: RunwaySettings,
): Promise<void> {
  const values = {
    monthlyExpenses: settings.monthlyExpenses,
    annualInflation: settings.annualInflation,
    monthlyContribution: settings.monthlyContribution,
  };
  await prisma.runwaySettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...values },
    update: values,
  });
}
