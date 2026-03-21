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
 * Formats currency value in EUR
 *
 * @param value - Value to format
 * @returns Formatted currency string in EUR
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
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
  const isPositive = totalReturn >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const isDailyPositive = dailyChange >= 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
      {/* Total Value */}
      <StatCard
        icon={<Wallet className="w-4 h-4 text-primary" />}
        label="Total Value"
      >
        <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">
          {formatCurrency(totalValue)}
        </p>
      </StatCard>

      {/* Total Investment */}
      <StatCard
        icon={<PiggyBank className="w-4 h-4 text-primary" />}
        label="Invested"
      >
        <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">
          {formatCurrency(totalInvestment)}
        </p>
      </StatCard>

      {/* Total Return */}
      <StatCard
        icon={
          <TrendIcon
            className={`w-4 h-4 ${isPositive ? 'text-gain' : 'text-loss'}`}
          />
        }
        label="Return"
      >
        <p
          className={`text-lg sm:text-2xl font-bold tabular-nums ${isPositive ? 'text-gain' : 'text-loss'}`}
        >
          {formatCurrency(totalReturn)}
        </p>
        <span
          className={`text-xs sm:text-sm font-medium tabular-nums ${isPositive ? 'text-gain' : 'text-loss'}`}
        >
          {formatPercentage(totalReturnPercentage)}
        </span>
      </StatCard>

      {/* Daily Change */}
      <StatCard
        icon={
          <BarChart3
            className={`w-4 h-4 ${isDailyPositive ? 'text-gain' : 'text-loss'}`}
          />
        }
        label="Today"
      >
        <p
          className={`text-lg sm:text-2xl font-bold tabular-nums ${isDailyPositive ? 'text-gain' : 'text-loss'}`}
        >
          {formatCurrency(dailyChange)}
        </p>
      </StatCard>

      {/* Products */}
      <StatCard
        icon={<Package className="w-4 h-4 text-primary" />}
        label="Products"
      >
        <p className="text-lg sm:text-2xl font-bold text-foreground">
          {productCount}
        </p>
      </StatCard>

      {/* Profit Rate */}
      <div className="glass-card rounded-2xl bg-card shadow-sm col-span-2 sm:col-span-1 hover:shadow-md transition-shadow duration-300">
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
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}
