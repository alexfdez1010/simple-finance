/**
 * Dashboard client component - handles real-time updates
 * @module components/dashboard/dashboard-client
 */

'use client';

import { ProductCard } from '@/components/products/product-card';
import { PortfolioStats } from '@/components/dashboard/portfolio-stats';
import { PortfolioEvolutionChart } from '@/components/dashboard/portfolio-evolution-chart';
import { DailyChangesChart } from '@/components/dashboard/daily-changes-chart';
import { deleteProductAction } from '@/lib/actions/product-actions';
import { calculateProfitRatesSync } from '@/lib/domain/services/profit-rate-calculator';
import type { FinancialProduct } from '@/lib/domain/models/product.types';
import Link from 'next/link';

/**
 * Product with enriched current value data
 */
type ProductWithValue = FinancialProduct & {
  currentValue: number;
};

interface DashboardClientProps {
  productsWithValues: ProductWithValue[];
  evolutionData: Array<{ date: string; value: number }>;
  dailyChanges: Array<{ date: string; change: number }>;
}

/**
 * Client component for dashboard interactivity
 * Receives server-rendered products with pre-fetched prices
 *
 * @param props - Component props
 * @returns Dashboard client element
 */
export function DashboardClient({
  productsWithValues,
  evolutionData,
  dailyChanges,
}: DashboardClientProps) {
  // Handle product deletion
  const handleDelete = async (productId: string) => {
    const result = await deleteProductAction(productId);
    if (!result.success) {
      alert(result.error || 'Failed to delete product');
    }
    // Page will revalidate automatically
  };

  // Calculate portfolio statistics
  const stats = productsWithValues.reduce(
    (acc, product) => {
      const totalValue = product.currentValue * product.quantity;

      acc.totalValue += totalValue;
      acc.productCount += 1;

      if (product.type === 'CUSTOM') {
        const initialInvestment =
          product.custom.initialInvestment * product.quantity;
        acc.totalInvestment += initialInvestment;
      } else if (product.type === 'YAHOO_FINANCE') {
        const initialInvestment =
          product.yahoo.purchasePrice * product.quantity;
        acc.totalInvestment += initialInvestment;
      }

      return acc;
    },
    {
      totalValue: 0,
      totalInvestment: 0,
      productCount: 0,
    },
  );

  const totalReturn = stats.totalValue - stats.totalInvestment;
  const totalReturnPercentage =
    stats.totalInvestment > 0 ? (totalReturn / stats.totalInvestment) * 100 : 0;

  // Calculate profit rates for custom products only
  const profitRates = calculateProfitRatesSync(productsWithValues);

  return (
    <>
      {/* Portfolio Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Portfolio Overview
        </h2>
        <PortfolioStats
          totalValue={stats.totalValue}
          totalReturn={totalReturn}
          totalReturnPercentage={totalReturnPercentage}
          dailyChange={0}
          dailyChangePercentage={0}
          productCount={stats.productCount}
          profitRates={profitRates}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PortfolioEvolutionChart data={evolutionData} />
        <DailyChangesChart data={dailyChanges} />
      </div>

      {/* Products List */}
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Your Products
      </h2>

      {productsWithValues.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No products yet. Add your first product to get started!
          </p>
          <Link
            href="/products/add"
            className="inline-block px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Add Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productsWithValues.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currentValue={product.currentValue}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}
