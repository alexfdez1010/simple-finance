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
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { FormError, LoadingButton } from '@/components/products/form-actions';
import { currencySymbol } from '@/components/products/currency-options';
import { CurrencySelect } from '@/components/products/currency-select';
import { FirstMovementFields } from '@/components/products/first-movement-fields';
import { AssetCategorySelect } from '@/components/products/asset-category-select';
import { DaysToLiquidityField } from '@/components/products/days-to-liquidity-field';
import {
  DEFAULT_ASSET_CATEGORY,
  type AssetCategory,
} from '@/lib/domain/models/asset-category';
import type { CustomProductCurrency } from '@/components/products/currency-options';

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
    currency: 'EUR' as CustomProductCurrency,
    annualReturnRate: '',
    firstMovementAmount: '',
    firstMovementDate: todayIso(),
    firstMovementNote: '',
  });
  const [assetCategory, setAssetCategory] = useState<AssetCategory>(
    DEFAULT_ASSET_CATEGORY,
  );
  const [daysToLiquidity, setDaysToLiquidity] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Updates one text-backed form value without mutating the current state. */
  const update = (field: string, value: string) =>
    setFormData({ ...formData, [field]: value });

  /** Maps first-movement field names to the action payload state. */
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
        assetCategory,
        parseInt(daysToLiquidity, 10) || 0,
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CurrencySelect
            id="custom-currency"
            value={formData.currency}
            onChange={(currency) =>
              setFormData((current) => ({ ...current, currency }))
            }
          />
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

        <AssetCategorySelect
          id="custom-category"
          value={assetCategory}
          onChange={setAssetCategory}
        />

        <DaysToLiquidityField
          id="custom-liquidity"
          value={daysToLiquidity}
          onChange={setDaysToLiquidity}
        />

        <FirstMovementFields
          currency={formData.currency}
          symbol={symbol}
          amount={formData.firstMovementAmount}
          date={formData.firstMovementDate}
          note={formData.firstMovementNote}
          maxDate={todayIso()}
          onChange={onMovementChange}
        />

        <aside className="rounded-md bg-muted/50 px-3 py-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Compound interest: A = P(1 + r/365)^days. Currency stays fixed after
            creation.
          </p>
        </aside>

        <FormError error={error} />

        <LoadingButton
          type="submit"
          loading={loading}
          loadingText="Adding..."
          className="w-full"
        >
          Add Product
        </LoadingButton>
      </FieldGroup>
    </form>
  );
}
