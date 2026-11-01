'use client';

import { Input } from '@/components/ui/input';
import type { ReactNode } from 'react';
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
  prominent = false,
  help,
}: {
  name: keyof RunwaySettings;
  label: string;
  value: number | string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  prominent?: boolean;
  help?: string;
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
        className={prominent ? 'h-12 text-xl' : undefined}
        aria-describedby={help ? `runway-${name}-help` : undefined}
      />
      {help && (
        <p id={`runway-${name}-help`} className="text-xs text-muted-foreground">
          {help}
        </p>
      )}
    </Field>
  );
}

/** Collects living cost and inflation first, with optional independent income and FIRE assumptions. */
export function RunwayFields({
  settings,
  actions,
}: {
  settings: RunwaySettings | null;
  actions: ReactNode;
}) {
  const values = settings ?? DEFAULT_RUNWAY_SETTINGS;
  return (
    <>
      <div className="grid items-end gap-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]">
        <NumberField
          name="monthlyExpenses"
          label="Monthly living cost (EUR)"
          value={settings?.monthlyExpenses ?? ''}
          prominent
        />
        <NumberField
          name="annualInflation"
          label="Annual inflation (%)"
          value={values.annualInflation * 100}
          min={-20}
          max={100}
          prominent
        />
        <div className="sm:col-span-2 lg:col-span-1">{actions}</div>
      </div>
      <details className="mt-4">
        <summary className="min-h-11 cursor-pointer text-sm font-medium text-primary">
          Income & simulation settings
        </summary>
        <div className="mt-3 grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <NumberField
            name="monthlyIncome"
            label="Other net income per month (EUR)"
            value={values.monthlyIncome}
            help="Excludes portfolio returns"
          />
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
            help="Blank uses the portfolio estimate"
          />
        </div>
      </details>
    </>
  );
}
