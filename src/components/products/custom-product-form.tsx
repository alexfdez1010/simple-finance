/**
 * Custom product creation form. Captures product metadata plus the first
 * movement (deposit). The currency selected here is fixed for the
 * lifetime of the product — every contribution is stored in that
 * currency and never converted to EUR at rest.
 *
 * @module components/products/custom-product-form
 */

'use client';

import { useState } from 'react';
import { createCustomProductAction } from '@/lib/actions/product-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { FormError } from '@/components/products/form-actions';
import {
  CURRENCY_OPTIONS,
  currencySymbol,
} from '@/components/products/currency-options';
import { FirstMovementFields } from '@/components/products/first-movement-fields';

interface CustomProductFormProps {
  onSuccess: () => void;
}

const todayIso = () => new Date().toISOString().split('T')[0];

/**
 * Custom product creation form with compound interest.
 *
 * @param props - Form props with success callback
 * @returns Form element
 */
export function CustomProductForm({ onSuccess }: CustomProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    currency: 'EUR',
    annualReturnRate: '',
    firstMovementAmount: '',
    firstMovementDate: todayIso(),
    firstMovementNote: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string, value: string) =>
    setFormData({ ...formData, [field]: value });

  const onMovementChange = (field: 'amount' | 'date' | 'note', value: string) =>
    update(
      field === 'amount'
        ? 'firstMovementAmount'
        : field === 'date'
          ? 'firstMovementDate'
          : 'firstMovementNote',
      value,
    );

  const symbol = currencySymbol(formData.currency);

  /** Handles form submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await createCustomProductAction(
        formData.name,
        parseFloat(formData.annualReturnRate) / 100,
        parseFloat(formData.firstMovementAmount),
        new Date(formData.firstMovementDate),
        formData.currency,
        formData.firstMovementNote.trim() || null,
      );
      if (!result.success)
        throw new Error(result.error || 'Failed to create product');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="custom-name">Product Name</FieldLabel>
          <Input
            id="custom-name"
            value={formData.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Savings Account"
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="custom-currency">Currency</FieldLabel>
            <select
              id="custom-currency"
              value={formData.currency}
              onChange={(e) => update('currency', e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              required
            >
              {CURRENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.symbol})
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="custom-rate">Annual Rate (%)</FieldLabel>
            <Input
              id="custom-rate"
              type="number"
              value={formData.annualReturnRate}
              onChange={(e) => update('annualReturnRate', e.target.value)}
              placeholder="5.0"
              step="0.00001"
              required
            />
          </Field>
        </div>

        <FirstMovementFields
          currency={formData.currency}
          symbol={symbol}
          amount={formData.firstMovementAmount}
          date={formData.firstMovementDate}
          note={formData.firstMovementNote}
          maxDate={todayIso()}
          onChange={onMovementChange}
        />

        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Compound interest A = P(1 + r/365)^days. The first movement above is
            saved as a contribution; add more deposits or withdrawals from the
            product&apos;s edit dialog. Currency is locked once the product is
            created so amounts cannot be silently reinterpreted.
          </p>
        </div>

        <FormError error={error} />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Adding...' : 'Add Product'}
        </Button>
      </FieldGroup>
    </form>
  );
}
