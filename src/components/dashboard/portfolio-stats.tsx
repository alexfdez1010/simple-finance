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
        <p className="display-number font-serif text-4xl font-semibold text-foreground sm:text-5xl">
          {formatCurrency(totalValue)}
        </p>
      </StatCard>

      <StatCard
        className="md:col-span-2 lg:col-span-2"
        icon={<PiggyBank aria-hidden size={16} weight="duotone" />}
        label="Invested"
      >
        <p className="display-number font-serif text-2xl font-semibold text-foreground">
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
          className={`display-number font-serif text-2xl font-semibold ${isPositive ? 'text-gain' : 'text-loss'}`}
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
        label="Today"
        tone={isDailyPositive ? 'gain' : 'loss'}
      >
        <p
          className={`display-number font-serif text-2xl font-semibold ${isDailyPositive ? 'text-gain' : 'text-loss'}`}
        >
          {formatCurrency(dailyChange)}
        </p>
      </StatCard>

      <StatCard
        className="md:col-span-2 lg:col-span-2"
        icon={<Package aria-hidden size={16} weight="duotone" />}
        label="Products"
      >
        <p className="display-number font-serif text-2xl font-semibold text-foreground">
          {productCount}
        </p>
      </StatCard>

      <Card
        aria-label="Projected profit"
        className="col-span-2 min-h-32 rounded-xl border border-border py-0 shadow-none md:col-span-4 lg:col-span-8"
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
      className={`min-h-32 border border-border py-0 shadow-none ${featured ? 'h-full rounded-xl bg-surface-secondary' : 'rounded-lg'} ${className ?? ''}`}
      role="group"
      variant={featured ? 'secondary' : 'default'}
    >
      <Card.Content
        className={`flex h-full flex-col justify-between ${featured ? 'p-5 sm:p-6 lg:p-7' : 'p-4 sm:p-5'}`}
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
