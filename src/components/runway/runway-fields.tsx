'use client';

import { Input } from '@/components/ui/input';
import type { ReactNode } from 'react';
import { Field, FieldLabel } from '@/components/ui/field';
import type { RunwaySettings } from '@/lib/domain/models/runway.types';

export const DEFAULT_RUNWAY_SETTINGS: RunwaySettings = {
  monthlyExpenses: 0,
  annualInflation: 0.02,
  monthlyContribution: 0,
};

/** Renders a labelled EUR or percentage input; browser constraints mirror server validation. */
export function RunwayNumberField({
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

/** Collects the shared monthly living cost and annual inflation assumptions. */
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
        <RunwayNumberField
          name="monthlyExpenses"
          label="Monthly living cost (EUR)"
          value={settings?.monthlyExpenses ?? ''}
          prominent
        />
        <RunwayNumberField
          name="annualInflation"
          label="Annual inflation (%)"
          value={values.annualInflation * 100}
          min={-20}
          max={100}
          prominent
        />
        <div className="sm:col-span-2 lg:col-span-1">{actions}</div>
      </div>
    </>
  );
}
