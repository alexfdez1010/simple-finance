import { Prisma } from '../../generated/prisma';
import { describe, expect, it } from 'vitest';
import {
  backupSchema,
  MAX_BACKUP_BYTES,
  parseBackup,
} from '@/lib/backup/backup-schema';
import { financeBackupFixture } from '../fixtures/finance-backup';

describe('portable finance backup validation', () => {
  it('includes every stored field of every Prisma model so schema changes cannot silently lose data', () => {
    const mapping = {
      FinancialProduct: 'products',
      YahooFinanceData: 'yahoo',
      CustomProductData: 'custom',
      CustomProductContribution: 'contributions',
      ProductSnapshot: 'productSnapshots',
      PortfolioSnapshot: 'portfolioSnapshots',
      RunwaySettings: 'runwaySettings',
    } as const;
    const fixture = financeBackupFixture();
    expect(
      Prisma.dmmf.datamodel.models
        .filter((model) => model.name in mapping)
        .map((model) => model.name)
        .sort(),
    ).toEqual(Object.keys(mapping).sort());
    for (const model of Prisma.dmmf.datamodel.models.filter(
      (model) => model.name in mapping,
    )) {
      const key = mapping[model.name as keyof typeof mapping];
      expect(Object.keys(fixture.data[key][0]).sort()).toEqual(
        model.fields
          .filter((field) => field.kind !== 'object')
          .map((field) => field.name)
          .sort(),
      );
    }
  });
  it('preserves every field without coercion, rounding or dropping nulls', () => {
    const fixture = financeBackupFixture();
    expect(parseBackup(JSON.stringify(fixture))).toEqual(fixture);
  });

  it('accepts a complete empty copy', () => {
    const fixture = financeBackupFixture();
    for (const key of Object.keys(
      fixture.data,
    ) as (keyof typeof fixture.data)[])
      fixture.data[key] = [];
    expect(backupSchema.safeParse(fixture).success).toBe(true);
  });

  it.each([
    [
      'version',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        copy.version = 2 as 1;
      },
    ],
    [
      'missing history',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        Reflect.deleteProperty(copy.data, 'productSnapshots');
      },
    ],
    [
      'unknown fields',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        Object.assign(copy.data.products[0], { ignored: true });
      },
    ],
    [
      'invalid timestamp',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        copy.exportedAt = 'yesterday';
      },
    ],
    [
      'lossy day',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        copy.data.productSnapshots[0].date = '2026-01-02T01:00:00.000Z';
      },
    ],
    [
      'duplicate product',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        copy.data.products.push(copy.data.products[0]);
      },
    ],
    [
      'missing detail',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        copy.data.custom = [];
      },
    ],
    [
      'wrong detail type',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        copy.data.custom[0].productId = 'yahoo';
      },
    ],
    [
      'orphan movement',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        copy.data.contributions[0].customProductDataId = 'missing';
      },
    ],
    [
      'orphan snapshot',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        copy.data.productSnapshots[0].productId = 'missing';
      },
    ],
    [
      'duplicate product day',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        copy.data.productSnapshots.push({
          ...copy.data.productSnapshots[0],
          id: 'duplicate',
        });
      },
    ],
    [
      'duplicate portfolio day',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        copy.data.portfolioSnapshots.push({
          ...copy.data.portfolioSnapshots[0],
          id: 'duplicate',
        });
      },
    ],
    [
      'duplicate detail',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        copy.data.custom.push({ ...copy.data.custom[0], id: 'duplicate' });
      },
    ],
    [
      'nonfinite number',
      (copy: ReturnType<typeof financeBackupFixture>) => {
        copy.data.contributions[0].amount = Infinity;
      },
    ],
  ])('rejects %s before mutation', (_, mutate) => {
    const fixture = financeBackupFixture();
    mutate(fixture);
    expect(backupSchema.safeParse(fixture).success).toBe(false);
  });

  it('rejects malformed and oversized JSON', () => {
    expect(() => parseBackup('{')).toThrow('complete Simple Finance backup');
    expect(() => parseBackup(' '.repeat(MAX_BACKUP_BYTES + 1))).toThrow(
      '20 MB',
    );
  });
});
