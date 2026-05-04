/**
 * Converts an amount expressed in a product's source currency into EUR,
 * dispatching to the right downstream rate service. Used by the dashboard
 * and snapshot pipelines to aggregate per-product values into a portfolio
 * total in EUR.
 *
 * Treats unknown currencies as EUR (1:1) so the system stays usable when a
 * legacy product has no `currency` value set.
 *
 * @module domain/services/product-currency-converter
 */

import { convertToEur } from './currency-converter';
import { convertCryptoAssetToEur } from './crypto-converter';

const DEFAULT_CURRENCY = 'EUR';

/**
 * Converts `amount` denominated in `currency` to EUR.
 *
 * @param amount - Amount in the source currency (may be negative)
 * @param currency - 'EUR' | 'USD' | 'BTC' | 'ETH' | 'XAUT' (default 'EUR')
 * @returns Equivalent amount in EUR
 */
export async function convertProductAmountToEur(
  amount: number,
  currency: string | null | undefined,
): Promise<number> {
  const code = (currency ?? DEFAULT_CURRENCY).toUpperCase();
  if (code === 'EUR') return amount;
  if (code === 'USD') return convertToEur(amount);
  if (code === 'BTC' || code === 'ETH' || code === 'XAUT') {
    return convertCryptoAssetToEur(amount, code);
  }
  return amount;
}
