import { Prisma } from '../../../../generated/prisma';
import { prisma } from './prisma-client';
import { backupSchema, type FinanceBackup } from '@/lib/backup/backup-schema';
import type { DisplayCurrency } from '@/lib/utils/format-currency';

/**
 * Reads all persisted records from one consistent snapshot without changing them.
 * @param displayCurrency - Browser preference to carry to another installation.
 * @returns A versioned copy preserving IDs, nulls, precision and timestamps; empty tables remain empty.
 * @throws On database errors or stored records incompatible with the portable format.
 */
export async function exportBackup(
  displayCurrency: DisplayCurrency,
): Promise<FinanceBackup> {
  const data = await prisma.$transaction(
    async (tx) => ({
      products: await tx.financialProduct.findMany({ orderBy: { id: 'asc' } }),
      yahoo: await tx.yahooFinanceData.findMany({ orderBy: { id: 'asc' } }),
      custom: await tx.customProductData.findMany({ orderBy: { id: 'asc' } }),
      contributions: await tx.customProductContribution.findMany({
        orderBy: { id: 'asc' },
      }),
      productSnapshots: await tx.productSnapshot.findMany({
        orderBy: { id: 'asc' },
      }),
      portfolioSnapshots: await tx.portfolioSnapshot.findMany({
        orderBy: { id: 'asc' },
      }),
      runwaySettings: await tx.runwaySettings.findMany({
        orderBy: { id: 'asc' },
      }),
    }),
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
  return backupSchema.parse(
    JSON.parse(
      JSON.stringify({
        format: 'simple-finance-backup',
        version: 1,
        exportedAt: new Date().toISOString(),
        preferences: { displayCurrency },
        data,
      }),
    ),
  );
}

/**
 * Revalidates and replaces all app records in one transaction, including empty collections.
 * @param input - Complete portable copy; rejected before mutation if invalid.
 * @returns Resolves after commit; any failed write rolls back the entire replacement.
 * Locks app tables against concurrent writes; never calls market-data services.
 */
export async function restoreBackup(input: FinanceBackup): Promise<void> {
  const { data } = backupSchema.parse(input);
  await prisma.$transaction(
    async (tx) => {
      // Serialize replacement against product edits and scheduled historical captures.
      await tx.$executeRaw`LOCK TABLE financial_products, yahoo_finance_data, custom_product_data,
      custom_product_contributions, product_snapshots, portfolio_snapshots, runway_settings
      IN EXCLUSIVE MODE`;
      await tx.financialProduct.deleteMany();
      await tx.portfolioSnapshot.deleteMany();
      await tx.runwaySettings.deleteMany();
      await tx.financialProduct.createMany({ data: data.products });
      await tx.yahooFinanceData.createMany({ data: data.yahoo });
      await tx.customProductData.createMany({ data: data.custom });
      await tx.customProductContribution.createMany({
        data: data.contributions,
      });
      await tx.productSnapshot.createMany({ data: data.productSnapshots });
      await tx.portfolioSnapshot.createMany({ data: data.portfolioSnapshots });
      await tx.runwaySettings.createMany({ data: data.runwaySettings });
    },
    { timeout: 60_000 },
  );
}
