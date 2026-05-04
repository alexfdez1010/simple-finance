/**
 * First-movement input group for the custom-product create form.
 * The amount, date and optional note are persisted as the product's first
 * contribution in the chosen currency (no EUR conversion).
 *
 * @module components/products/first-movement-fields
 */

'use client';

import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';

interface Props {
  currency: string;
  symbol: string;
  amount: string;
  date: string;
  note: string;
  maxDate: string;
  onChange: (field: 'amount' | 'date' | 'note', value: string) => void;
}

export function FirstMovementFields({
  currency,
  symbol,
  amount,
  date,
  note,
  maxDate,
  onChange,
}: Props) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs font-semibold text-foreground mb-2">
        First movement · {currency}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="custom-investment" className="text-[11px]">
            Amount ({symbol})
          </FieldLabel>
          <Input
            id="custom-investment"
            type="number"
            value={amount}
            onChange={(e) => onChange('amount', e.target.value)}
            placeholder="10000"
            step="0.00001"
            min="0"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="custom-date" className="text-[11px]">
            Date
          </FieldLabel>
          <Input
            id="custom-date"
            type="date"
            value={date}
            onChange={(e) => onChange('date', e.target.value)}
            max={maxDate}
            required
          />
        </Field>
      </div>
      <Field className="mt-2">
        <FieldLabel htmlFor="custom-note" className="text-[11px]">
          Note (optional)
        </FieldLabel>
        <Input
          id="custom-note"
          value={note}
          onChange={(e) => onChange('note', e.target.value)}
          placeholder="First deposit"
        />
      </Field>
    </div>
  );
}
