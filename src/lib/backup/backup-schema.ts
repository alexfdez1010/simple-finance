import { z } from 'zod';
import { backupDataSchema, type BackupData } from './record-schemas';

export const MAX_BACKUP_BYTES = 20 * 1024 * 1024;
export const displayCurrencySchema = z.enum([
  'EUR',
  'USD',
  'BTC',
  'ETH',
  'XAUT',
]);

/**
 * Checks uniqueness and complete typed relationships without mutating records.
 * @param data - Structurally validated table collections.
 * @returns Whether every key and relation is valid; a complete empty copy is valid.
 */
function hasValidRelations(data: BackupData): boolean {
  for (const records of Object.values(data)) {
    if (new Set(records.map((row) => row.id)).size !== records.length)
      return false;
  }
  const products = new Map(data.products.map((row) => [row.id, row.type]));
  const customIds = new Set(data.custom.map((row) => row.id));
  const detailIds = [...data.yahoo, ...data.custom].map((row) => row.productId);
  if (
    new Set(detailIds).size !== detailIds.length ||
    detailIds.length !== products.size
  )
    return false;
  if (data.yahoo.some((row) => products.get(row.productId) !== 'YAHOO_FINANCE'))
    return false;
  if (data.custom.some((row) => products.get(row.productId) !== 'CUSTOM'))
    return false;
  if (data.contributions.some((row) => !customIds.has(row.customProductDataId)))
    return false;
  if (data.productSnapshots.some((row) => !products.has(row.productId)))
    return false;
  const snapshotKeys = data.productSnapshots.map((row) =>
    JSON.stringify([row.productId, row.date]),
  );
  if (new Set(snapshotKeys).size !== snapshotKeys.length) return false;
  return (
    new Set(data.portfolioSnapshots.map((row) => row.date)).size ===
    data.portfolioSnapshots.length
  );
}

/** Versioned portable backup; rejects missing fields, unknown versions and broken relations. */
export const backupSchema = z.strictObject({
  format: z.literal('simple-finance-backup'),
  version: z.literal(1),
  exportedAt: z.iso.datetime({ precision: 3 }),
  preferences: z.strictObject({ displayCurrency: displayCurrencySchema }),
  data: backupDataSchema.refine(
    hasValidRelations,
    'Invalid or duplicate backup relationships',
  ),
});

export type FinanceBackup = z.infer<typeof backupSchema>;

/**
 * Parses an untrusted JSON copy without side effects or value coercion.
 * @param text - Entire UTF-8 JSON document.
 * @returns Validated copy; throws a user-facing error for invalid or oversized files.
 */
export function parseBackup(text: string): FinanceBackup {
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) {
    throw new Error('The backup exceeds the 20 MB limit.');
  }
  try {
    return backupSchema.parse(JSON.parse(text));
  } catch {
    throw new Error(
      'Choose a complete Simple Finance backup with a supported version.',
    );
  }
}
