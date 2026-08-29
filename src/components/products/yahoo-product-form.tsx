/**
 * Yahoo Finance product form for use in dialogs
 * @module components/products/yahoo-product-form
 */

'use client';

import { useState } from 'react';
import {
  validateYahooSymbol,
  createYahooProduct,
} from '@/lib/actions/product-actions';
import { type YahooQuote } from '@/lib/infrastructure/yahoo-finance/server-client';
import { FieldGroup } from '@/components/ui/field';
import { FormError, LoadingButton } from '@/components/products/form-actions';
import { AssetCategorySelect } from '@/components/products/asset-category-select';
import { DaysToLiquidityField } from '@/components/products/days-to-liquidity-field';
import {
  YahooProductFields,
  type YahooProductFormData,
} from '@/components/products/yahoo-product-fields';
import {
  DEFAULT_ASSET_CATEGORY,
  type AssetCategory,
} from '@/lib/domain/models/asset-category';

interface YahooProductFormProps {
  onSuccess: () => void;
}

/**
 * Yahoo Finance product creation form
 *
 * @param props - Form props with success callback
 * @returns Form element
 */
export function YahooProductForm({ onSuccess }: YahooProductFormProps) {
  const [formData, setFormData] = useState<YahooProductFormData>({
    name: '',
    symbol: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });
  const [assetCategory, setAssetCategory] = useState<AssetCategory>(
    DEFAULT_ASSET_CATEGORY,
  );
  const [daysToLiquidity, setDaysToLiquidity] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbolValidated, setSymbolValidated] = useState(false);
  const [quoteData, setQuoteData] = useState<YahooQuote | null>(null);
  const [validating, setValidating] = useState(false);

  /** Updates one Yahoo form field and invalidates symbol state when needed. */
  const update = (field: keyof YahooProductFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (field === 'symbol') setSymbolValidated(false);
  };

  /** Validates the stock symbol via Yahoo Finance */
  const handleSymbolBlur = async () => {
    if (!formData.symbol.trim()) {
      setSymbolValidated(false);
      setQuoteData(null);
      return;
    }
    setValidating(true);
    setError(null);
    try {
      const quote = await validateYahooSymbol(formData.symbol.toUpperCase());
      if (quote) {
        setSymbolValidated(true);
        setQuoteData(quote);
        if (!formData.name) {
          setFormData((prev) => ({
            ...prev,
            name: quote.shortName || quote.symbol,
            purchasePrice: quote.regularMarketPrice.toString(),
          }));
        } else if (!formData.purchasePrice) {
          setFormData((prev) => ({
            ...prev,
            purchasePrice: quote.regularMarketPrice.toString(),
          }));
        }
      } else {
        setSymbolValidated(false);
        setError('Invalid symbol');
      }
    } catch (err) {
      setSymbolValidated(false);
      setError(err instanceof Error ? err.message : 'Failed to validate');
    } finally {
      setValidating(false);
    }
  };

  /** Handles form submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbolValidated) {
      setError('Please validate the stock symbol first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await createYahooProduct(
        formData.name,
        formData.symbol.toUpperCase(),
        parseFloat(formData.quantity),
        parseFloat(formData.purchasePrice),
        new Date(formData.purchaseDate),
        assetCategory,
        parseInt(daysToLiquidity, 10) || 0,
      );
      if (!result.success) throw new Error(result.error || 'Failed');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-4">
        <YahooProductFields
          data={formData}
          validating={validating}
          symbolValidated={symbolValidated}
          quoteData={quoteData}
          onChange={update}
          onSymbolBlur={handleSymbolBlur}
        />

        <AssetCategorySelect
          id="yahoo-category"
          value={assetCategory}
          onChange={setAssetCategory}
        />

        <DaysToLiquidityField
          id="yahoo-liquidity"
          value={daysToLiquidity}
          onChange={setDaysToLiquidity}
        />

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
