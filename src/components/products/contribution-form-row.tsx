/**
 * Inline editor for a single contribution (amount + date + note).
 * Reused by the contributions list for both creating new movements and
 * editing existing ones.
 *
 * @module components/products/contribution-form-row
 */

'use client';

import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { LoadingButton } from '@/components/products/form-actions';

export interface ContributionFormState {
  amount: string;
  date: string;
  note: string;
}

interface Props {
  form: ContributionFormState;
  setForm: (f: ContributionFormState) => void;
  symbol: string;
  onCancel: () => void;
  onSave: () => void;
  busy: boolean;
}

/** Returns today's UTC calendar date for the native date maximum; no side effects. */
const todayIso = () => new Date().toISOString().split('T')[0];

/**
 * Renders a controlled movement editor with uniquely associated field labels.
 * @param props - Current fields, currency symbol, pending state and editor callbacks.
 * @returns Responsive inputs and save/cancel actions; busy disables every control.
 * Changes call setForm; actions call the supplied callbacks. Empty required fields block save.
 */
export function ContributionFormRow({
  form,
  setForm,
  symbol,
  onCancel,
  onSave,
  busy,
}: Props) {
  const fieldId = useId();
  /**
   * Sends one immutable field change to the parent; accepts empty values while editing.
   * @param field - Movement field to update.
   * @param value - New input value.
   * @returns Nothing; calls setForm without modifying the supplied state.
   */
  const update = (field: keyof ContributionFormState, value: string) =>
    setForm({ ...form, [field]: value });

  return (
    <div className="flex min-w-0 w-full flex-col gap-2">
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
        <Field className="min-w-0">
          <FieldLabel htmlFor={`${fieldId}-amount`} className="text-[11px]">
            Amount ({symbol})
          </FieldLabel>
          <Input
            id={`${fieldId}-amount`}
            className="min-h-11"
            type="number"
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
            placeholder="-100 = withdrawal"
            step="0.00001"
            disabled={busy}
            required
          />
        </Field>
        <Field className="min-w-0">
          <FieldLabel htmlFor={`${fieldId}-date`} className="text-[11px]">
            Date
          </FieldLabel>
          <Input
            id={`${fieldId}-date`}
            className="min-h-11"
            type="date"
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
            max={todayIso()}
            disabled={busy}
            required
          />
        </Field>
      </div>
      <Field className="min-w-0">
        <FieldLabel htmlFor={`${fieldId}-note`} className="text-[11px]">
          Note (optional)
        </FieldLabel>
        <Input
          id={`${fieldId}-note`}
          className="min-h-11"
          value={form.note}
          onChange={(e) => update('note', e.target.value)}
          placeholder="Monthly contribution"
          disabled={busy}
        />
      </Field>
      <div className="flex gap-2">
        <LoadingButton
          type="button"
          size="sm"
          className="min-h-11"
          onClick={onSave}
          disabled={busy || !form.amount || !form.date}
          loading={busy}
          loadingText="Saving..."
        >
          Save
        </LoadingButton>
        <Button
          type="button"
          size="sm"
          className="min-h-11"
          variant="outline"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
