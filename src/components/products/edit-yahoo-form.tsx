/**
 * Yahoo Finance product edit form component
 * @module components/products/edit-yahoo-form
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateYahooProductAction } from '@/lib/actions/product-actions';
import { FormField, inputClass } from '@/components/products/form-field';
import { FormActions, FormError } from '@/components/products/form-actions';
import type { YahooFinanceProduct } from '@/lib/domain/models/product.types';

interface EditYahooFormProps {
  product: YahooFinanceProduct;
}

/**
 * Edit form for Yahoo Finance products
 *
 * @param props - Product to edit
 * @returns Form element
 */
export function EditYahooForm({ product }: EditYahooFormProps) {
  const router = useRouter();
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
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField id="symbol" label="Stock Symbol">
        <input
          type="text"
          id="symbol"
          value={product.yahoo.symbol}
          disabled
          className={`${inputClass} opacity-50 cursor-not-allowed`}
        />
      </FormField>

      <FormField id="name" label="Product Name">
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => update('name', e.target.value)}
          required
          className={inputClass}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField id="quantity" label="Quantity">
          <input
            type="number"
            id="quantity"
            value={formData.quantity}
            onChange={(e) => update('quantity', e.target.value)}
            step="0.01"
            min="0.01"
            required
            className={inputClass}
          />
        </FormField>

        <FormField id="purchasePrice" label="Purchase Price (€)">
          <input
            type="number"
            id="purchasePrice"
            value={formData.purchasePrice}
            onChange={(e) => update('purchasePrice', e.target.value)}
            step="0.01"
            min="0.01"
            required
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField id="purchaseDate" label="Purchase Date">
        <input
          type="date"
          id="purchaseDate"
          value={formData.purchaseDate}
          onChange={(e) => update('purchaseDate', e.target.value)}
          required
          className={inputClass}
        />
      </FormField>

      <FormError error={error} />
      <FormActions
        loading={submitting}
        loadingText="Updating..."
        submitText="Update Product"
      />
    </form>
  );
}
