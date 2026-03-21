/**
 * Add custom product page
 * @module app/products/add-custom/page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomProductAction } from '@/lib/actions/product-actions';
import { FormLayout } from '@/components/products/form-layout';
import { FormField, inputClass } from '@/components/products/form-field';
import { FormActions, FormError } from '@/components/products/form-actions';

/**
 * Add custom product page component
 *
 * @returns Form page element
 */
export default function AddCustomProductPage() {
  const router = useRouter();
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

      if (!result.success) {
        throw new Error(result.error || 'Failed to create product');
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setFormData({ ...formData, [field]: value });

  const currencySymbol = formData.currency === 'EUR' ? '€' : '$';

  return (
    <FormLayout
      title="Add Custom Product"
      description="Track investments with fixed annual return rates"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField id="name" label="Product Name">
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => update('name', e.target.value)}
            className={inputClass}
            placeholder="Savings Account"
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="annualReturnRate"
            label="Annual Return Rate (%)"
            hint="Enter the annual return rate as a percentage (e.g., 5 for 5%)"
          >
            <input
              type="number"
              id="annualReturnRate"
              value={formData.annualReturnRate}
              onChange={(e) => update('annualReturnRate', e.target.value)}
              className={inputClass}
              placeholder="5.0"
              step="0.01"
              required
            />
          </FormField>

          <FormField id="currency" label="Currency">
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => update('currency', e.target.value)}
              className={inputClass}
              required
            >
              <option value="EUR">EUR ({currencySymbol})</option>
              <option value="USD">USD ($)</option>
            </select>
          </FormField>
        </div>

        <FormField
          id="initialInvestment"
          label={`Initial Investment (${currencySymbol})`}
          hint={`Enter amount in ${formData.currency === 'EUR' ? 'euros (€)' : 'dollars ($)'}`}
        >
          <input
            type="number"
            id="initialInvestment"
            value={formData.initialInvestment}
            onChange={(e) => update('initialInvestment', e.target.value)}
            className={inputClass}
            placeholder="10000"
            step="0.01"
            min="0.01"
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="investmentDate"
            label="Investment Date"
            hint="Date when the investment started"
          >
            <input
              type="date"
              id="investmentDate"
              value={formData.investmentDate}
              onChange={(e) => update('investmentDate', e.target.value)}
              className={inputClass}
              required
            />
          </FormField>

          <FormField
            id="quantity"
            label="Quantity"
            hint="Number of units (usually 1 for custom products)"
          >
            <input
              type="number"
              id="quantity"
              value={formData.quantity}
              onChange={(e) => update('quantity', e.target.value)}
              className={inputClass}
              placeholder="1"
              step="0.01"
              min="0.01"
              required
            />
          </FormField>
        </div>

        {/* Info Box */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
          <h3 className="text-xs font-semibold text-foreground mb-1">
            How it works
          </h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Custom products use compound interest to calculate daily values. The
            formula is: A = P(1 + r/365)^days, where P is your initial
            investment, r is the annual return rate, and days is the number of
            days since investment.
          </p>
        </div>

        <FormError error={error} />
        <FormActions loading={loading} loadingText="Adding..." />
      </form>
    </FormLayout>
  );
}
