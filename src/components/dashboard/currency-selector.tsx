/**
 * Display-currency dropdown selector.
 * Lets the user pick EUR/USD/BTC/ETH/XAUT; choice propagates through
 * the dashboard via DisplayCurrencyContext.
 * @module components/dashboard/currency-selector
 */

'use client';

import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import type { DisplayCurrency } from '@/lib/utils/format-currency';

const LABELS: Record<DisplayCurrency, string> = {
  EUR: 'EUR (€)',
  USD: 'USD ($)',
  BTC: 'BTC (₿)',
  ETH: 'ETH (Ξ)',
  XAUT: 'XAUT (Au)',
};

/**
 * Renders the compact currency switcher used in the dashboard header.
 *
 * @returns Select element bound to the display currency context
 */
export function CurrencySelector() {
  const { currency, setCurrency, supported } = useDisplayCurrency();

  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="hidden sm:inline">Display in</span>
      <select
        aria-label="Display currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value as DisplayCurrency)}
        className="h-9 rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {supported.map((c) => (
          <option key={c} value={c}>
            {LABELS[c]}
          </option>
        ))}
      </select>
    </label>
  );
}
