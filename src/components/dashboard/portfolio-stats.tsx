/**
 * Portfolio statistics display component
 * @module components/dashboard/portfolio-stats
 */

'use client';

import { ProfitRateDisplay } from '@/components/dashboard/profit-rate-display';
import type { ProfitRates } from '@/lib/domain/services/profit-rate-calculator';

/**
 * Portfolio statistics props
 */
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
 * Portfolio statistics component
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
  return (
    <div className="flex flex-wrap items-center gap-6">
      {/* Total Value */}
      <div className="flex-1 min-w-[150px] p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Total Value
        </p>
        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Total Return */}
      <div className="flex-1 min-w-[150px] p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Total Return
        </p>
        <div className="flex items-baseline gap-2">
          <p
            className={`text-xl font-bold ${
              totalReturn >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatCurrency(totalReturn)}
          </p>
          <span
            className={`text-sm font-medium ${
              totalReturnPercentage >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatPercentage(totalReturnPercentage)}
          </span>
        </div>
      </div>

      {/* Products Count */}
      <div className="flex-1 min-w-[100px] p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Products
        </p>
        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {productCount}
        </p>
      </div>

      <div className="flex-2 min-w-[250px]">
        <ProfitRateDisplay profitRates={profitRates} />
      </div>
    </div>
  );
}
