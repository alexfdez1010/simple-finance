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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { SymbolValidator } from '@/components/products/symbol-validator';
import { FormError } from '@/components/products/form-actions';

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
        <Field>
          <FieldLabel htmlFor="yahoo-symbol">Stock Symbol</FieldLabel>
          <Input
            id="yahoo-symbol"
            value={formData.symbol}
            onChange={(e) => {
              update('symbol', e.target.value);
              setSymbolValidated(false);
            }}
            onBlur={handleSymbolBlur}
            disabled={validating}
            className={symbolValidated ? 'ring-2 ring-gain border-gain' : ''}
            style={{ textTransform: 'uppercase' }}
            placeholder="AAPL"
            required
          />
          <SymbolValidator
            loading={validating}
            validated={symbolValidated}
            quoteData={quoteData}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="yahoo-name">Product Name</FieldLabel>
          <Input
            id="yahoo-name"
            value={formData.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Apple Stock"
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="yahoo-price">
              Purchase Price (&euro;)
            </FieldLabel>
            <Input
              id="yahoo-price"
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => update('purchasePrice', e.target.value)}
              placeholder="150.25"
              step="0.00001"
              min="0.01"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="yahoo-qty">Quantity</FieldLabel>
            <Input
              id="yahoo-qty"
              type="number"
              value={formData.quantity}
              onChange={(e) => update('quantity', e.target.value)}
              placeholder="10"
              step="0.0000001"
              min="0"
              required
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="yahoo-date">Purchase Date</FieldLabel>
          <Input
            id="yahoo-date"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => update('purchaseDate', e.target.value)}
            required
          />
        </Field>

        <FormError error={error} />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Adding...' : 'Add Product'}
        </Button>
      </FieldGroup>
    </form>
  );
}
