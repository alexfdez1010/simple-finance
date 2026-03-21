/**
 * Custom product edit form component
 * @module components/products/edit-custom-form
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomProductAction } from '@/lib/actions/product-actions';
import { FormField, inputClass } from '@/components/products/form-field';
import { FormActions, FormError } from '@/components/products/form-actions';
import type { CustomProduct } from '@/lib/domain/models/product.types';

interface EditCustomFormProps {
  product: CustomProduct;
}

/**
 * Edit form for custom products
 *
 * @param props - Product to edit
 * @returns Form element
 */
export function EditCustomForm({ product }: EditCustomFormProps) {
  const router = useRouter();
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

  const currencySymbol = formData.currency === 'EUR' ? '€' : '$';

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
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

        <FormField id="annualReturnRate" label="Annual Return Rate (%)">
          <input
            type="number"
            id="annualReturnRate"
            value={formData.annualReturnRate}
            onChange={(e) => update('annualReturnRate', e.target.value)}
            step="0.01"
            min="0"
            max="100"
            required
            className={inputClass}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField id="currency" label="Currency">
          <select
            id="currency"
            value={formData.currency}
            onChange={(e) => update('currency', e.target.value)}
            required
            className={inputClass}
          >
            <option value="EUR">EUR ({currencySymbol})</option>
            <option value="USD">USD ($)</option>
          </select>
        </FormField>

        <FormField
          id="initialInvestment"
          label={`Initial Investment (${currencySymbol})`}
        >
          <input
            type="number"
            id="initialInvestment"
            value={formData.initialInvestment}
            onChange={(e) => update('initialInvestment', e.target.value)}
            step="0.01"
            min="0.01"
            required
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField id="investmentDate" label="Investment Date">
        <input
          type="date"
          id="investmentDate"
          value={formData.investmentDate}
          onChange={(e) => update('investmentDate', e.target.value)}
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
