/**
 * Add Yahoo Finance product page
 * @module app/products/add/page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  validateYahooSymbol,
  createYahooProduct,
} from '@/lib/actions/product-actions';
import { type YahooQuote } from '@/lib/infrastructure/yahoo-finance/server-client';
import { FormLayout } from '@/components/products/form-layout';
import { FormField, inputClass } from '@/components/products/form-field';
import { FormActions, FormError } from '@/components/products/form-actions';
import { SymbolValidator } from '@/components/products/symbol-validator';

/** Add Yahoo Finance product page component */
export default function AddYahooProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbolValidated, setSymbolValidated] = useState(false);
  const [quoteData, setQuoteData] = useState<YahooQuote | null>(null);
  const [validating, setValidating] = useState(false);

  const update = (field: string, value: string) =>
    setFormData({ ...formData, [field]: value });

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
      );
      if (!result.success) throw new Error(result.error || 'Failed');
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormLayout
      title="Add Yahoo Finance Product"
      description="Track real stocks and assets using Yahoo Finance data"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField id="symbol" label="Stock Symbol" hint="e.g. AAPL, GOOGL">
          <input
            type="text"
            id="symbol"
            value={formData.symbol}
            onChange={(e) => {
              update('symbol', e.target.value);
              setSymbolValidated(false);
            }}
            onBlur={handleSymbolBlur}
            disabled={validating}
            className={`${inputClass} uppercase ${symbolValidated ? 'ring-2 ring-gain border-gain' : ''}`}
            placeholder="AAPL"
            required
          />
          <SymbolValidator
            loading={validating}
            validated={symbolValidated}
            quoteData={quoteData}
          />
        </FormField>

        <FormField id="name" label="Product Name">
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => update('name', e.target.value)}
            className={inputClass}
            placeholder="Apple Stock"
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="purchasePrice" label="Purchase Price (€)">
            <input
              type="number"
              id="purchasePrice"
              value={formData.purchasePrice}
              onChange={(e) => update('purchasePrice', e.target.value)}
              className={inputClass}
              placeholder="150.25"
              step="0.01"
              min="0.01"
              required
            />
          </FormField>
          <FormField id="quantity" label="Quantity">
            <input
              type="number"
              id="quantity"
              value={formData.quantity}
              onChange={(e) => update('quantity', e.target.value)}
              className={inputClass}
              placeholder="10"
              step="0.0000001"
              min="0.0000001"
              required
            />
          </FormField>
        </div>

        <FormField id="purchaseDate" label="Purchase Date">
          <input
            type="date"
            id="purchaseDate"
            value={formData.purchaseDate}
            onChange={(e) => update('purchaseDate', e.target.value)}
            className={inputClass}
            required
          />
        </FormField>

        <FormError error={error} />
        <FormActions loading={loading} loadingText="Adding..." />
      </form>
    </FormLayout>
  );
}
