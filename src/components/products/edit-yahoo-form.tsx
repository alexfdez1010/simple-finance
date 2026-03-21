/**
 * Yahoo Finance product edit form component
 * @module components/products/edit-yahoo-form
 */

'use client';

import { useState } from 'react';
import { updateYahooProductAction } from '@/lib/actions/product-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { FormError } from '@/components/products/form-actions';
import type { YahooFinanceProduct } from '@/lib/domain/models/product.types';

interface EditYahooFormProps {
  product: YahooFinanceProduct;
  onSuccess?: () => void;
}

/**
 * Edit form for Yahoo Finance products
 *
 * @param props - Product to edit with optional success callback
 * @returns Form element
 */
export function EditYahooForm({ product, onSuccess }: EditYahooFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: product.name,
    quantity: product.quantity.toString(),
    purchasePrice: product.yahoo.purchasePrice.toString(),
    purchaseDate: new Date(product.yahoo.purchaseDate)
      .toISOString()
      .split('T')[0],
  });

  const update = (field: string, value: string) =>
    setFormData({ ...formData, [field]: value });

  /** Handles form submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await updateYahooProductAction(
        product.id,
        formData.name,
        parseFloat(formData.quantity),
        parseFloat(formData.purchasePrice),
        new Date(formData.purchaseDate),
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
          <FieldLabel htmlFor="edit-symbol">Stock Symbol</FieldLabel>
          <Input
            id="edit-symbol"
            value={product.yahoo.symbol}
            disabled
            className="opacity-50 cursor-not-allowed"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="edit-name">Product Name</FieldLabel>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="edit-qty">Quantity</FieldLabel>
            <Input
              id="edit-qty"
              type="number"
              value={formData.quantity}
              onChange={(e) => update('quantity', e.target.value)}
              step="0.01"
              min="0.01"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="edit-price">
              Purchase Price (&euro;)
            </FieldLabel>
            <Input
              id="edit-price"
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => update('purchasePrice', e.target.value)}
              step="0.01"
              min="0.01"
              required
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="edit-date">Purchase Date</FieldLabel>
          <Input
            id="edit-date"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => update('purchaseDate', e.target.value)}
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
