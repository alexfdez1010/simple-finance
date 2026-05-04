/**
 * Custom product edit form. Splits product metadata (name, quantity, rate)
 * from the contributions list, which is managed by its own component with
 * full add/edit/delete CRUD. Currency is fixed at creation time and shown
 * read-only here.
 *
 * @module components/products/edit-custom-form
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomProductAction } from '@/lib/actions/product-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { FormError } from '@/components/products/form-actions';
import { currencySymbol } from '@/components/products/currency-options';
import { CustomContributions } from '@/components/products/custom-contributions';
import type { CustomProduct } from '@/lib/domain/models/product.types';

interface EditCustomFormProps {
  product: CustomProduct;
  onSuccess?: () => void;
}

/**
 * Edit form for custom products. Saving updates metadata; contribution
 * changes are persisted immediately by the embedded list and trigger a
 * router refresh so derived totals stay in sync.
 *
 * @param props - Product to edit with optional success callback
 * @returns Form element
 */
export function EditCustomForm({ product, onSuccess }: EditCustomFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: product.name,
    annualReturnRate: (product.custom.annualReturnRate * 100).toString(),
  });
  const currency = product.custom.currency;
  const symbol = currencySymbol(currency);

  const update = (field: string, value: string) =>
    setFormData({ ...formData, [field]: value });

  /** Handles form submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await updateCustomProductAction(
        product.id,
        formData.name,
        parseFloat(formData.annualReturnRate) / 100,
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
    <div className="flex flex-col gap-6">
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

          <Field>
            <FieldLabel htmlFor="edit-custom-rate">Annual Rate (%)</FieldLabel>
            <Input
              id="edit-custom-rate"
              type="number"
              value={formData.annualReturnRate}
              onChange={(e) => update('annualReturnRate', e.target.value)}
              step="0.00001"
              min="0"
              max="100"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-custom-currency">Currency</FieldLabel>
            <Input
              id="edit-custom-currency"
              value={`${currency} (${symbol})`}
              readOnly
              aria-readonly
              className="cursor-not-allowed bg-muted/40"
            />
            <p className="text-[11px] text-muted-foreground">
              Currency is fixed at creation so existing movements cannot be
              silently reinterpreted.
            </p>
          </Field>

          <FormError error={error} />

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Product'}
          </Button>
        </FieldGroup>
      </form>

      <div className="border-t border-border pt-4">
        <CustomContributions
          customProductDataId={product.custom.id}
          currency={currency}
          contributions={product.custom.contributions}
          onChanged={() => router.refresh()}
        />
      </div>
    </div>
  );
}
