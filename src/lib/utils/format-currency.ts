/**
 * Display-currency formatting utilities.
 * Values are stored in EUR everywhere; these helpers convert to the user's
 * chosen display currency and render with appropriate precision.
 * @module lib/utils/format-currency
 */

export type DisplayCurrency = 'EUR' | 'USD' | 'BTC' | 'ETH' | 'XAUT';

interface CurrencyMeta {
  /** True if Intl.NumberFormat supports it via style: 'currency'. */
  intl: boolean;
  code: string;
  symbol: string;
  /** Max fraction digits for standard (non-compact) display. */
  maxFrac: number;
}

const CURRENCY_META: Record<DisplayCurrency, CurrencyMeta> = {
  EUR: { intl: true, code: 'EUR', symbol: '€', maxFrac: 2 },
  USD: { intl: false, code: 'USD', symbol: '$', maxFrac: 2 },
  BTC: { intl: false, code: 'BTC', symbol: '₿', maxFrac: 6 },
  ETH: { intl: false, code: 'ETH', symbol: 'Ξ', maxFrac: 6 },
  XAUT: { intl: false, code: 'XAUT', symbol: '🜚', maxFrac: 6 },
};

export interface FormatOptions {
  /** Use compact notation (e.g. "1,2 K €"). */
  compact?: boolean;
  /** Force absolute value (caller renders its own sign). */
  absolute?: boolean;
}

/**
 * Converts an EUR amount into the target display currency.
 *
 * @param eurAmount - Amount in EUR
 * @param rate - Multiplier (1 EUR → rate units of target currency)
 * @returns Converted amount
 */
export function convertFromEur(eurAmount: number, rate: number): number {
  return eurAmount * rate;
}

/**
 * Formats an EUR amount in the chosen display currency.
 * Uses Intl for fiat (EUR/USD) and manual symbol+number for crypto/XAUT
 * since Intl.NumberFormat does not support those currency codes.
 *
 * @param eurAmount - Amount in EUR
 * @param currency - Display currency
 * @param rate - Multiplier (1 EUR → rate units of currency)
 * @param opts - Formatting options
 * @returns Formatted string
 */
export function formatInCurrency(
  eurAmount: number,
  currency: DisplayCurrency,
  rate: number,
  opts: FormatOptions = {},
): string {
  const meta = CURRENCY_META[currency];
  const raw = eurAmount * rate;
  const value = opts.absolute ? Math.abs(raw) : raw;

  if (meta.intl) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: meta.code,
      notation: opts.compact ? 'compact' : 'standard',
      maximumFractionDigits: opts.compact ? 1 : 2,
    }).format(value);
  }

  const num = value.toLocaleString('es-ES', {
    notation: opts.compact ? 'compact' : 'standard',
    minimumFractionDigits: opts.compact ? 0 : 2,
    maximumFractionDigits: opts.compact ? 2 : meta.maxFrac,
  });
  return `${num} ${meta.symbol}`;
}
