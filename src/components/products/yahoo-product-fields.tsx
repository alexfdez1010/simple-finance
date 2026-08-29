/** Core Yahoo Finance fields shared by the create flow. */

'use client';

import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { SymbolValidator } from '@/components/products/symbol-validator';
import type { YahooQuote } from '@/lib/infrastructure/yahoo-finance/server-client';

export interface YahooProductFormData {
  name: string;
  symbol: string;
  quantity: string;
  purchasePrice: string;
  purchaseDate: string;
}

interface YahooProductFieldsProps {
  data: YahooProductFormData;
  validating: boolean;
  symbolValidated: boolean;
  quoteData: YahooQuote | null;
  onChange: (field: keyof YahooProductFormData, value: string) => void;
  onSymbolBlur: () => void;
}

/**
 * Renders the market-symbol, name, purchase, quantity, and date fields.
 *
 * @param props - Yahoo form state, validation state, and event callbacks.
 * @returns The accessible field group used by Yahoo product creation.
 */
export function YahooProductFields({
  data,
  validating,
  symbolValidated,
  quoteData,
  onChange,
  onSymbolBlur,
}: YahooProductFieldsProps) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="yahoo-symbol">Stock Symbol</FieldLabel>
        <Input
          id="yahoo-symbol"
          value={data.symbol}
          onChange={(event) => onChange('symbol', event.target.value)}
          onBlur={onSymbolBlur}
          disabled={validating}
          aria-describedby="symbol-validation-status"
          className={symbolValidated ? 'ring-2 ring-gain' : 'uppercase'}
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
          value={data.name}
          onChange={(event) => onChange('name', event.target.value)}
          placeholder="Apple Stock"
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="yahoo-price">Purchase Price (€)</FieldLabel>
          <Input
            id="yahoo-price"
            type="number"
            value={data.purchasePrice}
            onChange={(event) => onChange('purchasePrice', event.target.value)}
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
            value={data.quantity}
            onChange={(event) => onChange('quantity', event.target.value)}
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
          value={data.purchaseDate}
          onChange={(event) => onChange('purchaseDate', event.target.value)}
          max={new Date().toISOString().split('T')[0]}
          required
        />
      </Field>
    </>
  );
}
