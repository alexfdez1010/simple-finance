/**
 * Custom product edit form component
 * @module components/products/edit-custom-form
 */

'use client';

import { useState } from 'react';
import { updateCustomProductAction } from '@/lib/actions/product-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { FormError } from '@/components/products/form-actions';
import type { CustomProduct } from '@/lib/domain/models/product.types';

interface EditCustomFormProps {
  product: CustomProduct;
  onSuccess?: () => void;
}

/**
 * Edit form for custom products
 *
 * @param props - Product to edit with optional success callback
 * @returns Form element
 */
export function EditCustomForm({ product, onSuccess }: EditCustomFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: product.name,
    quantity: product.quantity.toString(),
    annualReturnRate: (product.custom.annualReturnRate * 100).toString(),
    initialInvestment: product.custom.initialInvestment.toString(),
    investmentDate: new Date(product.custom.investmentDate)
      .toISOString()
      .split('T')[0],
    currency: product.custom.currency,
  });

  const update = (field: string, value: string) =>
    setFormData({ ...formData, [field]: value });

  const currencySymbol = formData.currency === 'EUR' ? '\u20AC' : '$';

  /** Handles form submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await updateCustomProductAction(
        product.id,
        formData.name,
        parseFloat(formData.quantity),
        parseFloat(formData.annualReturnRate) / 100,
        parseFloat(formData.initialInvestment),
        new Date(formData.investmentDate),
        formData.currency,
      );
      if (!result.success) {
        throw new Error(result.error || 'Failed to update product');
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="edit-custom-name">Product Name</FieldLabel>
          <Input
            id="edit-custom-name"
            value={formData.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="edit-custom-qty">Quantity</FieldLabel>
            <Input
              id="edit-custom-qty"
              type="number"
              value={formData.quantity}
              onChange={(e) => update('quantity', e.target.value)}
              step="0.01"
              min="0.01"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-custom-rate">Annual Rate (%)</FieldLabel>
            <Input
              id="edit-custom-rate"
              type="number"
              value={formData.annualReturnRate}
              onChange={(e) => update('annualReturnRate', e.target.value)}
              step="0.01"
              min="0"
              max="100"
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="edit-custom-currency">Currency</FieldLabel>
            <select
              id="edit-custom-currency"
              value={formData.currency}
              onChange={(e) => update('currency', e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              required
            >
              <option value="EUR">EUR ({currencySymbol})</option>
              <option value="USD">USD ($)</option>
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-custom-inv">
              Investment ({currencySymbol})
            </FieldLabel>
            <Input
              id="edit-custom-inv"
              type="number"
              value={formData.initialInvestment}
              onChange={(e) => update('initialInvestment', e.target.value)}
              step="0.01"
              min="0.01"
              required
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="edit-custom-date">Investment Date</FieldLabel>
          <Input
            id="edit-custom-date"
            type="date"
            value={formData.investmentDate}
            onChange={(e) => update('investmentDate', e.target.value)}
            required
          />
        </Field>

        <FormError error={error} />

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Updating...' : 'Update Product'}
        </Button>
      </FieldGroup>
    </form>
  );
}
