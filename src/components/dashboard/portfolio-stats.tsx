/**
 * Portfolio statistics display component
 * @module components/dashboard/portfolio-stats
 */

'use client';

import { TrendingUp, TrendingDown, Wallet, Package } from 'lucide-react';
import { ProfitRateDisplay } from '@/components/dashboard/profit-rate-display';
import type { ProfitRates } from '@/lib/domain/services/profit-rate-calculator';

interface PortfolioStatsProps {
  totalValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  productCount: number;
  profitRates: ProfitRates;
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
  productCount,
  profitRates,
}: PortfolioStatsProps) {
  const isPositive = totalReturn >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-stretch sm:gap-4 lg:gap-5">
      {/* Total Value */}
      <div className="glass-card rounded-2xl bg-card p-4 sm:p-5 shadow-sm border border-border flex-1 min-w-[140px]">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-4 h-4 text-primary" />
          <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Value
          </p>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums">
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Total Return */}
      <div className="glass-card rounded-2xl bg-card p-4 sm:p-5 shadow-sm border border-border flex-1 min-w-[140px]">
        <div className="flex items-center gap-2 mb-2">
          <TrendIcon
            className={`w-4 h-4 ${isPositive ? 'text-gain' : 'text-loss'}`}
          />
          <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Return
          </p>
        </div>
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
      </div>

      {/* Products */}
      <div className="glass-card rounded-2xl bg-card p-4 sm:p-5 shadow-sm border border-border flex-1 min-w-[100px]">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-primary" />
          <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Products
          </p>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-foreground">
          {productCount}
        </p>
      </div>

      {/* Profit Rate */}
      <div className="glass-card rounded-2xl bg-card shadow-sm border border-border flex-1 min-w-[160px] col-span-2 sm:col-span-1">
        <ProfitRateDisplay profitRates={profitRates} />
      </div>
    </div>
  );
}
