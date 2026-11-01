import { z } from 'zod';

const id = z.string().min(1);
const timestamp = z.iso.datetime({ precision: 3 });
const audit = { id, createdAt: timestamp, updatedAt: timestamp };
const day = timestamp.refine((value) => value.endsWith('T00:00:00.000Z'));

/** Lossless persisted records, including legacy nullable cost bases and settings. */
export const backupDataSchema = z.strictObject({
  products: z.array(
    z.strictObject({
      ...audit,
      type: z.enum(['YAHOO_FINANCE', 'CUSTOM']),
      assetCategory: z.enum([
        'STOCKS',
        'BONDS_LOANS',
        'COMMODITIES',
        'REAL_ESTATE',
        'CASH',
      ]),
      name: z.string(),
      quantity: z.number(),
      daysToLiquidity: z.int().min(0),
    }),
  ),
  yahoo: z.array(
    z.strictObject({
      ...audit,
      productId: id,
      symbol: z.string(),
      purchasePrice: z.number(),
      purchaseDate: timestamp,
    }),
  ),
  custom: z.array(
    z.strictObject({
      ...audit,
      productId: id,
      annualReturnRate: z.number(),
      currency: z.string(),
    }),
  ),
  contributions: z.array(
    z.strictObject({
      ...audit,
      customProductDataId: id,
      amount: z.number(),
      amountEur: z.number().nullable(),
      date: timestamp,
      note: z.string().nullable(),
    }),
  ),
  productSnapshots: z.array(
    z.strictObject({
      id,
      productId: id,
      date: day,
      value: z.number(),
      quantity: z.number(),
      createdAt: timestamp,
    }),
  ),
  portfolioSnapshots: z.array(
    z.strictObject({
      id,
      date: day,
      value: z.number(),
      investedEur: z.number().nullable(),
      createdAt: timestamp,
    }),
  ),
  runwaySettings: z.array(
    z.strictObject({
      id,
      monthlyExpenses: z.number(),
      monthlyIncome: z.number(),
      annualInflation: z.number(),
      withdrawalRate: z.number(),
      targetYears: z.int(),
      monthlyContribution: z.number(),
      annualReturnOverride: z.number().nullable(),
      updatedAt: timestamp,
    }),
  ),
});

export type BackupData = z.infer<typeof backupDataSchema>;
