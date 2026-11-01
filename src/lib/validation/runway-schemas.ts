import { z } from 'zod';

/** Validates EUR cash amounts and annual decimal assumptions without coercing missing data. */
export const runwaySettingsSchema = z
  .object({
    monthlyExpenses: z.number().min(0).max(1_000_000_000),
    monthlyIncome: z.number().min(0).max(1_000_000_000),
    annualInflation: z.number().min(-0.2).max(1),
    withdrawalRate: z.number().min(0.001).max(0.2),
    targetYears: z.number().int().min(1).max(50),
    monthlyContribution: z.number().min(0).max(1_000_000_000),
    annualReturnOverride: z.number().min(-0.99).max(1).nullable(),
  })
  .strict();
