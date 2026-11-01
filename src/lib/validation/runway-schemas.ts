import { z } from 'zod';

/** Validates EUR cash amounts and annual decimal assumptions without coercing missing data. */
export const runwaySettingsSchema = z
  .object({
    monthlyExpenses: z.number().min(0).max(1_000_000_000),
    annualInflation: z.number().min(-0.2).max(1),
    monthlyContribution: z.number().min(0).max(1_000_000_000),
  })
  .strict();
