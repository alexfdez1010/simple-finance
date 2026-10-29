'use client';

import { ArrowDownRight, ArrowUpRight, Wallet } from '@phosphor-icons/react';
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
 * Composes the portfolio balance, comparable figures, and return projections.
 * @param props - EUR totals, holding count, estimates, and optional snapshot date.
 * @returns Currency-aware summary; missing snapshot changes remain unavailable.
 * Reads only the display preference; period selection stays within its control.
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
  const { currency, format } = useDisplayCurrency();
  const positive = totalReturn >= 0;
  const ReturnIcon = positive ? ArrowUpRight : ArrowDownRight;
  const figures = [
    {
      label: 'Invested',
      value: format(totalInvestment),
      detail: 'Net contributed capital',
    },
    {
      label: 'Return',
      value: format(totalReturn),
      detail: `${totalReturnPercentage >= 0 ? '+' : ''}${totalReturnPercentage.toFixed(2)}% on invested capital`,
      tone: positive ? 'text-gain' : 'text-loss',
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
      className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]"
    >
      <div
        role="group"
        aria-label="Total Value"
        className="balance-surface flex min-w-0 flex-col justify-between rounded-2xl p-6 sm:p-8"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-sm font-medium text-white/75">
            <Wallet aria-hidden size={18} /> Total Value
          </p>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/80">
            {productCount} holdings
          </span>
        </div>
        <p
          key={currency}
          className="display-number value-change my-8 text-[clamp(2rem,3.5vw,3.25rem)] leading-tight font-medium sm:my-9"
        >
          {format(totalValue)}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-white/65">Current portfolio valuation</p>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${positive ? 'bg-[#253e38] text-[#93e2b2]' : 'bg-[#4a303a] text-[#ffb5bc]'}`}
          >
            <ReturnIcon aria-hidden size={14} weight="bold" />
            {totalReturnPercentage >= 0 ? '+' : ''}
            {totalReturnPercentage.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="finance-card flex min-w-0 flex-col justify-between p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-4">
          {figures.map(({ label, value, detail, tone }) => (
            <div
              key={label}
              role="group"
              aria-label={label}
              className="min-w-0 last:col-span-2 sm:last:col-span-1"
            >
              <p className="text-xs font-medium text-muted-foreground">
                {label}
              </p>
              <p
                key={currency}
                className={`display-number value-change mt-2 text-[22px] font-semibold sm:mt-4 ${tone ?? 'text-foreground'}`}
              >
                {value}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                {detail}
              </p>
            </div>
          ))}
        </div>
        <div
          role="group"
          aria-label="Projected profit"
          className="mt-5 grid gap-3 border-t border-border pt-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-end sm:gap-6"
        >
          <ProfitRateDisplay profitRates={profitRates} />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Estimates use available return assumptions. They are projections,
            not guaranteed returns.
          </p>
        </div>
      </div>
    </section>
  );
}
