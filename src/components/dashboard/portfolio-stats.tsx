/**
 * Portfolio statistics display component
 * @module components/dashboard/portfolio-stats
 */

'use client';

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Package,
  PiggyBank,
  BarChart3,
} from 'lucide-react';
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
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const isDailyPositive = dailyChange >= 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
      <StatCard
        icon={<Wallet className="w-3.5 h-3.5" />}
        label="Total Value"
        featured
      >
        <p className="display-number text-xl sm:text-3xl font-semibold font-serif text-foreground">
          {formatCurrency(totalValue)}
        </p>
      </StatCard>

      <StatCard icon={<PiggyBank className="w-3.5 h-3.5" />} label="Invested">
        <p className="display-number text-xl sm:text-3xl font-semibold font-serif text-foreground">
          {formatCurrency(totalInvestment)}
        </p>
      </StatCard>

      <StatCard
        icon={<TrendIcon className="w-3.5 h-3.5" />}
        label="Return"
        tone={isPositive ? 'gain' : 'loss'}
      >
        <p
          className={`display-number text-xl sm:text-3xl font-semibold font-serif ${isPositive ? 'text-gain' : 'text-loss'}`}
        >
          {formatCurrency(totalReturn)}
        </p>
        <span
          className={`text-xs sm:text-sm font-medium tabular-nums ${isPositive ? 'text-gain' : 'text-loss'}`}
        >
          {formatPercentage(totalReturnPercentage)}
        </span>
      </StatCard>

      <StatCard
        icon={<BarChart3 className="w-3.5 h-3.5" />}
        label="Today"
        tone={isDailyPositive ? 'gain' : 'loss'}
      >
        <p
          className={`display-number text-xl sm:text-3xl font-semibold font-serif ${isDailyPositive ? 'text-gain' : 'text-loss'}`}
        >
          {formatCurrency(dailyChange)}
        </p>
      </StatCard>

      <StatCard icon={<Package className="w-3.5 h-3.5" />} label="Products">
        <p className="display-number text-xl sm:text-3xl font-semibold font-serif text-foreground">
          {productCount}
        </p>
      </StatCard>

      <div className="glass-card gradient-border beam lift relative rounded-2xl bg-card shadow-sm col-span-2 sm:col-span-1">
        <ProfitRateDisplay profitRates={profitRates} />
      </div>
    </div>
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
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  tone?: 'gain' | 'loss';
  featured?: boolean;
}) {
  const iconColor =
    tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-gold';
  return (
    <div
      className={`glass-card gradient-border beam lift relative rounded-2xl bg-card p-4 sm:p-5 shadow-sm overflow-hidden ${featured ? 'ring-1 ring-[oklch(0.68_0.13_78/25%)]' : ''}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`${iconColor}`}>{icon}</span>
        <p className="eyebrow !text-[0.62rem] !tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
      </div>
      <div className="hairline mb-3 opacity-60" />
      {children}
    </div>
  );
}
