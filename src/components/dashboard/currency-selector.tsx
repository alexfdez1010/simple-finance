/**
 * Display-currency dropdown selector.
 * Lets the user pick EUR/USD/BTC/ETH/XAUT; choice propagates through
 * the dashboard via DisplayCurrencyContext.
 * @module components/dashboard/currency-selector
 */

'use client';

import { Label, ListBox, Select } from '@heroui/react';
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
    <Select
      className="w-28"
      aria-label="Display currency"
      variant="secondary"
      value={currency}
      onChange={(value) => {
        if (typeof value === 'string') setCurrency(value as DisplayCurrency);
      }}
    >
      <Label className="sr-only">Display currency</Label>
      <Select.Trigger className="min-h-8 px-2.5">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className="min-w-36">
        <ListBox aria-label="Currencies" selectionMode="single">
          {supported.map((currencyOption) => (
            <ListBox.Item
              id={currencyOption}
              key={currencyOption}
              textValue={LABELS[currencyOption]}
            >
              {LABELS[currencyOption]}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
