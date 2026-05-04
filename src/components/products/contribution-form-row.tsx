/**
 * Inline editor for a single contribution (amount + date + note).
 * Reused by the contributions list for both creating new movements and
 * editing existing ones.
 *
 * @module components/products/contribution-form-row
 */

'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';

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

/**
 * Renders the amount/date/note inputs plus Save/Cancel buttons.
 */
const todayIso = () => new Date().toISOString().split('T')[0];

export function ContributionFormRow({
  form,
  setForm,
  symbol,
  onCancel,
  onSave,
  busy,
}: Props) {
  const update = (field: keyof ContributionFormState, value: string) =>
    setForm({ ...form, [field]: value });

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Field>
          <FieldLabel className="text-[11px]">Amount ({symbol})</FieldLabel>
          <Input
            type="number"
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
            placeholder="-100 = withdrawal"
            step="0.00001"
            disabled={busy}
            required
          />
        </Field>
        <Field>
          <FieldLabel className="text-[11px]">Date</FieldLabel>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
            max={todayIso()}
            disabled={busy}
            required
          />
        </Field>
      </div>
      <Field>
        <FieldLabel className="text-[11px]">Note (optional)</FieldLabel>
        <Input
          value={form.note}
          onChange={(e) => update('note', e.target.value)}
          placeholder="Monthly contribution"
          disabled={busy}
        />
      </Field>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={busy || !form.amount || !form.date}
        >
          {busy ? 'Saving...' : 'Save'}
        </Button>
        <Button
          type="button"
          size="sm"
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
