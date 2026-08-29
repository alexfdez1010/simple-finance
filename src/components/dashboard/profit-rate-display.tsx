/**
 * Profit rate display component with cycling periods
 * Shows daily/weekly/monthly profit from custom + Yahoo products. Yahoo
 * products feed in the geometric-mean annual return of their last 5 years.
 * @module components/dashboard/profit-rate-display
 */

'use client';

import { useState } from 'react';
import { Button } from '@heroui/react';
import { ArrowRight } from '@phosphor-icons/react';
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

  /** Advances to the next supported profit period. */
  const handleCycle = () => {
    const currentIndex = PERIOD_ORDER.indexOf(currentPeriod);
    const nextIndex = (currentIndex + 1) % PERIOD_ORDER.length;
    setCurrentPeriod(PERIOD_ORDER[nextIndex]);
  };

  const config = PERIOD_CONFIG[currentPeriod];
  const value = profitRates[config.valueKey];
  const pct = profitRates[config.pctKey];
  const sign = value >= 0 ? '+' : '';
  const absoluteValue = format(value, { absolute: true });
  const signedValue = value >= 0 ? `+${absoluteValue}` : `-${absoluteValue}`;

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">
          {config.label} profit
        </p>
        <Button
          onPress={handleCycle}
          size="sm"
          variant="ghost"
          aria-label={`Show ${config.next.toLowerCase()} profit`}
        >
          {config.next}
          <ArrowRight aria-hidden size={14} />
        </Button>
      </div>
      <div className="flex flex-wrap items-baseline gap-2">
        <p
          className={`font-serif text-2xl font-semibold tabular-nums ${
            value >= 0 ? 'text-gain' : 'text-loss'
          }`}
        >
          {signedValue}
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
    </div>
  );
}
