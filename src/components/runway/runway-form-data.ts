import { runwaySettingsSchema } from '@/lib/validation/runway-schemas';

/** Reads EUR inputs and converts annual percentages to decimals; empty required fields remain invalid. */
export function readRunwayForm(form: HTMLFormElement) {
  const data = new FormData(form);
  const amount = (key: string) =>
    data.get(key) === '' ? NaN : Number(data.get(key));
  return runwaySettingsSchema.safeParse({
    monthlyExpenses: amount('monthlyExpenses'),
    annualInflation: amount('annualInflation') / 100,
    monthlyContribution: amount('monthlyContribution'),
  });
}
