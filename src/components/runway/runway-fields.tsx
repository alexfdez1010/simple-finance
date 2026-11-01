'use client';

import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import type { RunwaySettings } from '@/lib/domain/models/runway.types';

export const DEFAULT_RUNWAY_SETTINGS: RunwaySettings = {
  monthlyExpenses: 0,
  monthlyIncome: 0,
  annualInflation: 0.02,
  withdrawalRate: 0.04,
  targetYears: 10,
  monthlyContribution: 0,
  annualReturnOverride: null,
};

/** Renders a labelled EUR or percentage input; browser constraints mirror server validation. */
function NumberField({
  name,
  label,
  value,
  min = 0,
  max = 1e9,
  step = 0.01,
  required = true,
}: {
  name: keyof RunwaySettings;
  label: string;
  value: number | string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={`runway-${name}`}>{label}</FieldLabel>
      <Input
        id={`runway-${name}`}
        name={name}
        type="number"
        inputMode="decimal"
        defaultValue={value}
        min={min}
        max={max}
        step={step}
        required={required}
      />
    </Field>
  );
}

/** Collects living cost and inflation first, with optional independent income and FIRE assumptions. */
export function RunwayFields({
  settings,
}: {
  settings: RunwaySettings | null;
}) {
  const values = settings ?? DEFAULT_RUNWAY_SETTINGS;
  return (
    <>
      <div className="space-y-5">
        <NumberField
          name="monthlyExpenses"
          label="Monthly living cost (EUR)"
          value={settings?.monthlyExpenses ?? ''}
        />
        <NumberField
          name="annualInflation"
          label="Annual inflation (%)"
          value={values.annualInflation * 100}
          min={-20}
          max={100}
        />
      </div>
      <details className="mt-6">
        <summary className="min-h-11 cursor-pointer text-sm font-medium text-primary">
          Income & simulation settings
        </summary>
        <div className="mt-3 space-y-5">
          <NumberField
            name="monthlyIncome"
            label="Other net income per month (EUR)"
            value={values.monthlyIncome}
          />
          <p className="text-xs text-muted-foreground">
            Salary or other recurring income while drawing down. Excludes
            portfolio returns.
          </p>
          <NumberField
            name="monthlyContribution"
            label="Monthly investment after living costs (EUR)"
            value={values.monthlyContribution}
          />
          <NumberField
            name="targetYears"
            label="Years to reach FIRE"
            value={values.targetYears}
            min={1}
            max={50}
            step={1}
          />
          <NumberField
            name="withdrawalRate"
            label="Annual FIRE withdrawal rate (%)"
            value={values.withdrawalRate * 100}
            min={0.1}
            max={20}
          />
          <NumberField
            name="annualReturnOverride"
            label="Annual return override (%)"
            value={
              values.annualReturnOverride == null
                ? ''
                : values.annualReturnOverride * 100
            }
            min={-99}
            max={100}
            required={false}
          />
          <p className="text-xs text-muted-foreground">
            Leave the return blank to use the weighted estimate of your whole
            portfolio.
          </p>
        </div>
      </details>
    </>
  );
}
