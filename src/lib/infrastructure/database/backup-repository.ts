import { getDatabase } from '@/lib/cloudflare/context';
import { backupSchema, type FinanceBackup } from '@/lib/backup/backup-schema';
import type { DisplayCurrency } from '@/lib/utils/format-currency';
import { backupTables, portableRow } from './backup-tables';
import { backupChunks } from './backup-chunks';

/**
 * Exports financial tables from a single atomic D1 batch, excluding accounts and OAuth secrets.
 * @param displayCurrency - Browser preference included in the existing version 1 format.
 * @returns Validated portable copy; throws on database or schema errors without mutations.
 */
export async function exportBackup(
  displayCurrency: DisplayCurrency,
): Promise<FinanceBackup> {
  const db = getDatabase();
  const entries = Object.entries(backupTables);
  const results = await db.batch<Record<string, unknown>>(
    entries.map(([, table]) =>
      db.prepare(`SELECT * FROM "${table}" ORDER BY id ASC`),
    ),
  );
  return backupSchema.parse({
    format: 'simple-finance-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    preferences: { displayCurrency },
    data: Object.fromEntries(
      entries.map(([key], index) => [
        key,
        results[index].results.map(portableRow),
      ]),
    ),
  });
}

/**
 * Validates before replacing financial data in one D1 batch transaction, preserving the account.
 * @param input - Complete version 1 backup, including empty collections.
 * @returns Resolves only after the atomic commit; any failed statement rolls everything back.
 */
export async function restoreBackup(input: FinanceBackup): Promise<void> {
  const { data } = backupSchema.parse(input);
  const db = getDatabase();
  const statements = [
    db.prepare('DELETE FROM financial_products'),
    db.prepare('DELETE FROM portfolio_snapshots'),
    db.prepare('DELETE FROM runway_settings'),
  ];
  for (const [key, table] of Object.entries(backupTables)) {
    const records = data[key as keyof typeof data];
    if (!records.length) continue;
    const columns = Object.keys(records[0]);
    // One bound JSON argument avoids D1's 100-parameter limit for large histories.
    const select = columns
      .map((column) => `json_extract(value, '$.${column}')`)
      .join(', ');
    const names = columns.map((column) => `"${column}"`).join(', ');
    const normalized = records.map((record) =>
      Object.fromEntries(
        Object.entries(record).map(([column, value]) => [
          column,
          typeof value === 'string' &&
          ['date', 'purchaseDate', 'createdAt', 'updatedAt'].includes(column)
            ? value.replace('Z', '+00:00')
            : value,
        ]),
      ),
    );
    for (const chunk of backupChunks(normalized))
      statements.push(
        db
          .prepare(
            `INSERT INTO "${table}" (${names}) SELECT ${select} FROM json_each(?)`,
          )
          .bind(chunk),
      );
  }
  await db.batch(statements);
}
