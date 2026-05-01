/**
 * Custom product form for use in dialogs
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

interface CustomProductFormProps {
  onSuccess: () => void;
}

/**
 * Custom product creation form with compound interest
 *
 * @param props - Form props with success callback
 * @returns Form element
 */
export function CustomProductForm({ onSuccess }: CustomProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    annualReturnRate: '',
    initialInvestment: '',
    investmentDate: '',
    quantity: '1',
    currency: 'EUR',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string, value: string) =>
    setFormData({ ...formData, [field]: value });

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
        parseFloat(formData.initialInvestment),
        new Date(formData.investmentDate),
        parseFloat(formData.quantity),
        formData.currency,
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
        </div>

        <Field>
          <FieldLabel htmlFor="custom-investment">
            Initial Investment ({symbol})
          </FieldLabel>
          <Input
            id="custom-investment"
            type="number"
            value={formData.initialInvestment}
            onChange={(e) => update('initialInvestment', e.target.value)}
            placeholder="10000"
            step="0.00001"
            min="0"
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="custom-date">Investment Date</FieldLabel>
            <Input
              id="custom-date"
              type="date"
              value={formData.investmentDate}
              onChange={(e) => update('investmentDate', e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="custom-qty">Quantity</FieldLabel>
            <Input
              id="custom-qty"
              type="number"
              value={formData.quantity}
              onChange={(e) => update('quantity', e.target.value)}
              placeholder="1"
              step="0.00001"
              min="0"
              required
            />
          </Field>
        </div>

        {/* Info Box */}
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs font-semibold text-foreground mb-1">
            How it works
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Uses compound interest: A = P(1 + r/365)^days
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
