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
  XAUT: { intl: false, code: 'XAUT', symbol: '☉', maxFrac: 6 },
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
 * Joins compact decimal tokens with stable spacing across Intl engine versions.
 * @param value - Converted amount, including its intended sign.
 * @param meta - Currency symbol and existing compact precision policy.
 * @returns Localized compact amount with explicit unit and currency separators.
 * Pure formatting; zero and negative zero retain their Intl numeric meaning.
 */
function formatCompactAmount(value: number, meta: CurrencyMeta): string {
  const parts = new Intl.NumberFormat('es-ES', {
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: meta.intl ? 1 : 2,
  }).formatToParts(value);
  const amount = parts
    .filter((part) => part.type !== 'literal')
    .map((part) =>
      part.type === 'compact' ? ` ${part.value.trim()}` : part.value,
    )
    .join('');
  return `${amount} ${meta.symbol}`;
}

/**
 * Formats an EUR amount in the chosen display currency.
 * Uses Intl currency formatting for standard EUR amounts and explicit symbols
 * for other currencies; compact token spacing is stable during hydration.
 *
 * @param eurAmount - Amount in EUR
 * @param currency - Display currency
 * @param rate - Multiplier (1 EUR → rate units of currency)
 * @param opts - Formatting options
 * @returns Formatted string without mutating the amount or display preference.
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

  if (opts.compact) return formatCompactAmount(value, meta);

  if (meta.intl) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: meta.code,
      maximumFractionDigits: 2,
    }).format(value);
  }

  const num = value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: meta.maxFrac,
  });
  return `${num} ${meta.symbol}`;
}
