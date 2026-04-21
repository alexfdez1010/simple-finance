/**
 * Shared currency metadata for custom product forms.
 * Supports fiat (EUR/USD) and crypto/commodity-backed assets via CoinGecko.
 * @module components/products/currency-options
 */

export type CustomProductCurrency = 'EUR' | 'USD' | 'BTC' | 'ETH' | 'XAUT';

interface CurrencyOption {
  value: CustomProductCurrency;
  label: string;
  symbol: string;
}

export const CURRENCY_OPTIONS: readonly CurrencyOption[] = [
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'BTC', label: 'BTC', symbol: '₿' },
  { value: 'ETH', label: 'ETH', symbol: 'Ξ' },
  { value: 'XAUT', label: 'XAUT', symbol: 'Au' },
] as const;

/**
 * Returns display symbol for a currency, defaulting to EUR sign.
 *
 * @param currency - Currency code
 * @returns Unicode symbol
 */
export function currencySymbol(currency: string): string {
  return CURRENCY_OPTIONS.find((o) => o.value === currency)?.symbol ?? '€';
}
