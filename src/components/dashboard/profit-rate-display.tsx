/**
 * Profit rate display component with cycling periods
 * Shows daily/weekly/monthly profit from custom products only
 * @module components/dashboard/profit-rate-display
 */

'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import type { ProfitRates } from '@/lib/domain/services/profit-rate-calculator';

type ProfitPeriod = 'daily' | 'weekly' | 'monthly' | 'annual';

const PERIOD_CONFIG: Record<
  ProfitPeriod,
  {
    label: string;
    valueKey: keyof ProfitRates;
    pctKey: keyof ProfitRates;
    next: string;
  }
> = {
  daily: {
    label: 'Daily',
    valueKey: 'daily',
    pctKey: 'dailyPct',
    next: 'Weekly',
  },
  weekly: {
    label: 'Weekly',
    valueKey: 'weekly',
    pctKey: 'weeklyPct',
    next: 'Monthly',
  },
  monthly: {
    label: 'Monthly',
    valueKey: 'monthly',
    pctKey: 'monthlyPct',
    next: 'Annual',
  },
  annual: {
    label: 'Annual',
    valueKey: 'annual',
    pctKey: 'annualPct',
    next: 'Daily',
  },
};

const PERIOD_ORDER: ProfitPeriod[] = ['daily', 'weekly', 'monthly', 'annual'];

interface ProfitRateDisplayProps {
  profitRates: ProfitRates;
}

/**
 * Profit rate display component
 * Cycles through daily/weekly/monthly/annual on button click
 *
 * @param props - Component props
 * @returns Profit rate display element
 */
export function ProfitRateDisplay({ profitRates }: ProfitRateDisplayProps) {
  const { format } = useDisplayCurrency();
  const [currentPeriod, setCurrentPeriod] = useState<ProfitPeriod>('daily');

  const formatSigned = (value: number): string => {
    const formatted = format(value, { absolute: true });
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const handleCycle = () => {
    const currentIndex = PERIOD_ORDER.indexOf(currentPeriod);
    const nextIndex = (currentIndex + 1) % PERIOD_ORDER.length;
    setCurrentPeriod(PERIOD_ORDER[nextIndex]);
  };

  const config = PERIOD_CONFIG[currentPeriod];
  const value = profitRates[config.valueKey];
  const pct = profitRates[config.pctKey];
  const sign = value >= 0 ? '+' : '';

  return (
    <div className="p-4 sm:p-5 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {config.label} Profit
        </p>
        <button
          onClick={handleCycle}
          className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-2 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
          aria-label="Cycle profit period"
        >
          {config.next}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <p
          className={`text-lg sm:text-2xl font-bold tabular-nums ${
            value >= 0 ? 'text-gain' : 'text-loss'
          }`}
        >
          {formatSigned(value)}
        </p>
        <span
          className={`text-xs sm:text-sm font-semibold tabular-nums ${
            value >= 0 ? 'text-gain' : 'text-loss'
          }`}
        >
          {sign}
          {pct.toFixed(2)}%
        </span>
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
        Based on custom products
      </p>
    </div>
  );
}
