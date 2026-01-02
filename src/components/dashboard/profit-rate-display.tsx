/**
 * Profit rate display component with cycling periods
 * Shows daily/weekly/monthly profit from custom products only
 * @module components/dashboard/profit-rate-display
 */

'use client';

import { useState } from 'react';
import type { ProfitRates } from '@/lib/domain/services/profit-rate-calculator';

/**
 * Period type for profit display
 */
type ProfitPeriod = 'daily' | 'weekly' | 'monthly' | 'annual';

/**
 * Period configuration
 */
const PERIOD_CONFIG: Record<
  ProfitPeriod,
  { label: string; key: keyof ProfitRates }
> = {
  daily: { label: 'Daily', key: 'daily' },
  weekly: { label: 'Weekly', key: 'weekly' },
  monthly: { label: 'Monthly', key: 'monthly' },
  annual: { label: 'Annual', key: 'annual' },
};

/**
 * Order of periods for cycling
 */
const PERIOD_ORDER: ProfitPeriod[] = ['daily', 'weekly', 'monthly', 'annual'];

interface ProfitRateDisplayProps {
  profitRates: ProfitRates;
}

/**
 * Formats currency value in EUR with sign
 *
 * @param value - Value to format
 * @returns Formatted currency string
 */
function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Math.abs(value));

  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * Profit rate display component
 * Cycles through daily/weekly/monthly on button click
 *
 * @param props - Component props
 * @returns Profit rate display element
 */
export function ProfitRateDisplay({ profitRates }: ProfitRateDisplayProps) {
  const [currentPeriod, setCurrentPeriod] = useState<ProfitPeriod>('daily');

  const handleCycle = () => {
    const currentIndex = PERIOD_ORDER.indexOf(currentPeriod);
    const nextIndex = (currentIndex + 1) % PERIOD_ORDER.length;
    setCurrentPeriod(PERIOD_ORDER[nextIndex]);
  };

  const config = PERIOD_CONFIG[currentPeriod];
  const value = profitRates[config.key];

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {config.label} Profit
        </p>
        <button
          onClick={handleCycle}
          className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          aria-label="Cycle profit period"
        >
          {currentPeriod === 'daily' && '→ Weekly'}
          {currentPeriod === 'weekly' && '→ Monthly'}
          {currentPeriod === 'monthly' && '→ Annual'}
          {currentPeriod === 'annual' && '→ Daily'}
        </button>
      </div>
      <p
        className={`text-2xl font-bold ${
          value >= 0
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {formatCurrency(value)}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Based on custom products only
      </p>
    </div>
  );
}
