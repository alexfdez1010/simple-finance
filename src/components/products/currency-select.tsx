/** Currency selector for custom product creation. */

'use client';

import {
  CURRENCY_OPTIONS,
  type CustomProductCurrency,
} from '@/components/products/currency-options';
import { ProductSelect } from '@/components/products/product-select';

interface CurrencySelectProps {
  id: string;
  value: CustomProductCurrency;
  onChange: (value: CustomProductCurrency) => void;
}

const options = CURRENCY_OPTIONS.map((option) => ({
  value: option.value,
  label: `${option.label} (${option.symbol})`,
}));

/**
 * Renders the currencies supported by custom products.
 *
 * @param props - Select identity, current currency, and change callback.
 * @returns A HeroUI currency select.
 */
export function CurrencySelect({ id, value, onChange }: CurrencySelectProps) {
  return (
    <ProductSelect
      id={id}
      label="Currency"
      value={value}
      options={options}
      onChange={onChange}
    />
  );
}
