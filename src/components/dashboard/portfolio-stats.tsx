'use client';

import { ProfitRateDisplay } from './profit-rate-display';
import { useDisplayCurrency } from './display-currency-context';
import type { ProfitRates } from '@/lib/domain/services/profit-rate-calculator';

interface PortfolioStatsProps {
  totalValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  totalInvestment: number;
  productCount: number;
  profitRates: ProfitRates;
  dailyChange: number;
  latestChangeDate?: string;
}

/**
 * Renders comparable portfolio figures on a single compact ledger surface.
 * @param props - EUR totals, forecasts, holding count, and optional snapshot date.
 * @returns Currency-aware summary; missing historical changes show an em dash.
 * No reads or mutations; profit period changes are delegated to its own control.
 */
export function PortfolioStats({
  totalValue,
  totalReturn,
  totalReturnPercentage,
  totalInvestment,
  productCount,
  profitRates,
  dailyChange,
  latestChangeDate,
}: PortfolioStatsProps) {
  const { format } = useDisplayCurrency();
  const figures = [
    {
      label: 'Total Value',
      value: format(totalValue),
      detail: `${productCount} holdings · current valuation`,
    },
    {
      label: 'Invested',
      value: format(totalInvestment),
      detail: 'Net contributed capital',
    },
    {
      label: 'Return',
      value: format(totalReturn),
      detail: `${totalReturnPercentage >= 0 ? '+' : ''}${totalReturnPercentage.toFixed(2)}% on invested capital`,
      tone: totalReturn >= 0 ? 'text-gain' : 'text-loss',
    },
    {
      label: 'Latest change',
      value: latestChangeDate ? format(dailyChange) : '—',
      detail: latestChangeDate ?? 'Awaiting snapshots',
      tone: latestChangeDate
        ? dailyChange >= 0
          ? 'text-gain'
          : 'text-loss'
        : undefined,
    },
  ];
  return (
    <section
      aria-label="Portfolio summary"
      className="finance-card overflow-hidden"
    >
      <div className="grid grid-cols-2 xl:grid-cols-4">
        {figures.map(({ label, value, detail, tone }) => (
          <div
            key={label}
            role="group"
            aria-label={label}
            className="min-w-0 p-5 sm:p-6"
          >
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p
              className={`display-number mt-3 text-xl font-semibold sm:text-2xl ${tone ?? 'text-foreground'}`}
            >
              {value}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {detail}
            </p>
          </div>
        ))}
      </div>
      <div
        role="group"
        aria-label="Projected profit"
        className="grid gap-4 border-t border-border bg-surface-secondary px-5 py-4 sm:grid-cols-2 sm:items-center sm:gap-8 sm:px-6"
      >
        <ProfitRateDisplay profitRates={profitRates} />
        <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">
          Estimates use available return assumptions. They are projections, not
          guaranteed returns.
        </p>
      </div>
    </section>
  );
}
