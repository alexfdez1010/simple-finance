/**
 * Portfolio statistics display component
 * @module components/dashboard/portfolio-stats
 */

'use client';

import { Card } from '@heroui/react';
import {
  ChartBar,
  Package,
  PiggyBank,
  TrendDown,
  TrendUp,
  Wallet,
} from '@phosphor-icons/react';
import { ProfitRateDisplay } from '@/components/dashboard/profit-rate-display';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
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
 * Formats percentage value with sign
 *
 * @param value - Value to format
 * @returns Formatted percentage string
 */
function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/**
 * Portfolio statistics component with responsive card layout
 *
 * @param props - Component props
 * @returns Statistics display element
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
  const { format: formatCurrency } = useDisplayCurrency();
  const isPositive = totalReturn >= 0;
  const TrendIcon = isPositive ? TrendUp : TrendDown;
  const isDailyPositive = dailyChange >= 0;

  return (
    <section
      aria-label="Portfolio summary"
      className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-12"
    >
      <StatCard
        className="col-span-2 md:col-span-4 lg:col-span-4 lg:row-span-2"
        icon={<Wallet aria-hidden size={16} weight="duotone" />}
        label="Total Value"
        featured
      >
        <p className="display-number font-sans text-4xl font-semibold text-foreground sm:text-5xl lg:text-[2.6rem]">
          {formatCurrency(totalValue)}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Across {productCount} holdings · current valuation
        </p>
      </StatCard>

      <StatCard
        className="md:col-span-2 lg:col-span-2"
        icon={<PiggyBank aria-hidden size={16} weight="duotone" />}
        label="Invested"
      >
        <p className="display-number font-serif text-lg font-semibold xl:text-xl text-foreground">
          {formatCurrency(totalInvestment)}
        </p>
      </StatCard>

      <StatCard
        className="md:col-span-2 lg:col-span-2"
        icon={<TrendIcon aria-hidden size={16} weight="duotone" />}
        label="Return"
        tone={isPositive ? 'gain' : 'loss'}
      >
        <p
          className={`display-number font-serif text-lg font-semibold xl:text-xl ${isPositive ? 'text-gain' : 'text-loss'}`}
        >
          {formatCurrency(totalReturn)}
        </p>
        <span
          className={`text-xs font-medium tabular-nums ${isPositive ? 'text-gain' : 'text-loss'}`}
        >
          {formatPercentage(totalReturnPercentage)}
        </span>
      </StatCard>

      <StatCard
        className="md:col-span-2 lg:col-span-2"
        icon={<ChartBar aria-hidden size={16} weight="duotone" />}
        label="Latest change"
        tone={isDailyPositive ? 'gain' : 'loss'}
      >
        <p
          className={`display-number font-serif text-lg font-semibold xl:text-xl ${isDailyPositive ? 'text-gain' : 'text-loss'}`}
        >
          {latestChangeDate ? formatCurrency(dailyChange) : '—'}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {latestChangeDate ?? 'Awaiting snapshots'}
        </p>
      </StatCard>

      <StatCard
        className="md:col-span-2 lg:col-span-2"
        icon={<Package aria-hidden size={16} weight="duotone" />}
        label="Products"
      >
        <p className="display-number font-serif text-lg font-semibold xl:text-xl text-foreground">
          {productCount}
        </p>
      </StatCard>

      <Card
        aria-label="Projected profit"
        className="finance-card col-span-2 min-h-32 py-0 md:col-span-4 lg:col-span-8"
        role="group"
        variant="secondary"
      >
        <Card.Content className="h-full p-4 sm:p-5">
          <ProfitRateDisplay profitRates={profitRates} />
        </Card.Content>
      </Card>
    </section>
  );
}

/**
 * Reusable stat card wrapper
 *
 * @param props - icon, label, and children content
 * @returns Stat card element
 */
function StatCard({
  icon,
  label,
  children,
  tone,
  featured,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  tone?: 'gain' | 'loss';
  featured?: boolean;
  className?: string;
}) {
  const iconColor =
    tone === 'gain'
      ? 'text-gain'
      : tone === 'loss'
        ? 'text-loss'
        : 'text-muted-foreground';
  return (
    <Card
      aria-label={label}
      className={`finance-card min-h-32 py-0 ${featured ? 'wealth-surface h-full' : ''} ${className ?? ''}`}
      role="group"
      variant={featured ? 'secondary' : 'default'}
    >
      <Card.Content
        className={`flex h-full flex-col justify-between ${featured ? 'p-5 sm:p-6 lg:p-7' : 'p-3 sm:p-4'}`}
      >
        <div className="mb-4 flex items-center gap-2">
          <span className={`${iconColor}`}>{icon}</span>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
        <div>{children}</div>
      </Card.Content>
    </Card>
  );
}
