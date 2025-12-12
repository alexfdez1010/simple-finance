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
  dailyChange: number;
  dailyChangePercentage: number;
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
  dailyChange,
  dailyChangePercentage,
  productCount,
  profitRates,
}: PortfolioStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Value */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
          Total Value
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Total Return */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
          Total Return
        </p>
        <p
          className={`text-2xl font-bold ${
            totalReturn >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatCurrency(totalReturn)}
        </p>
        <p
          className={`text-sm ${
            totalReturnPercentage >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatPercentage(totalReturnPercentage)}
        </p>
      </div>

      {/* Daily Change */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
          Daily Change
        </p>
        <p
          className={`text-2xl font-bold ${
            dailyChange >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatCurrency(dailyChange)}
        </p>
        <p
          className={`text-sm ${
            dailyChangePercentage >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {formatPercentage(dailyChangePercentage)}
        </p>
      </div>

      {/* Products Count */}
      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
          Products
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {productCount}
        </p>
      </div>

      <ProfitRateDisplay profitRates={profitRates} />
    </div>
  );
}
