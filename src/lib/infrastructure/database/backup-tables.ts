import type { BackupData } from '@/lib/backup/record-schemas';

/** Explicit allowlist; backup payloads cannot select arbitrary tables or credentials. */
export const backupTables: Record<keyof BackupData, string> = {
  products: 'financial_products',
  yahoo: 'yahoo_finance_data',
  custom: 'custom_product_data',
  contributions: 'custom_product_contributions',
  productSnapshots: 'product_snapshots',
  portfolioSnapshots: 'portfolio_snapshots',
  runwaySettings: 'runway_settings',
};

/** Normalizes D1's ISO timestamp representation to the existing portable backup format. */
export function portableRow(
  row: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      key === 'reinvestInterest'
        ? Boolean(value)
        : value !== null &&
            ['createdAt', 'updatedAt', 'purchaseDate', 'date'].includes(key)
          ? new Date(value as string | number).toISOString()
          : value,
    ]),
  );
}
