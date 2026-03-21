/**
 * Dashboard client component with lazy-loaded charts
 * @module components/dashboard/dashboard-client
 */

'use client';

import dynamic from 'next/dynamic';
import { ProductCard } from '@/components/products/product-card';
import { PortfolioStats } from '@/components/dashboard/portfolio-stats';
import { deleteProductAction } from '@/lib/actions/product-actions';
import { calculateProfitRatesSync } from '@/lib/domain/services/profit-rate-calculator';
import { ChartLoadingSkeleton } from '@/components/dashboard/loading-skeletons';
import type { ProductWithValue } from '@/lib/domain/models/product.types';
import Link from 'next/link';

/** Lazy-load chart components to reduce initial bundle size */
const MonthlyWealthChart = dynamic(
  () =>
    import('@/components/dashboard/monthly-wealth-chart').then(
      (m) => m.MonthlyWealthChart,
    ),
  { loading: () => <ChartLoadingSkeleton />, ssr: false },
);

const PortfolioEvolutionChart = dynamic(
  () =>
    import('@/components/dashboard/portfolio-evolution-chart').then(
      (m) => m.PortfolioEvolutionChart,
    ),
  { loading: () => <ChartLoadingSkeleton />, ssr: false },
);

const DailyChangesChart = dynamic(
  () =>
    import('@/components/dashboard/daily-changes-chart').then(
      (m) => m.DailyChangesChart,
    ),
  { loading: () => <ChartLoadingSkeleton />, ssr: false },
);

interface DashboardClientProps {
  productsWithValues: ProductWithValue[];
  evolutionData: Array<{ date: string; value: number }>;
  monthlyWealthData: Array<{ month: string; value: number }>;
  dailyChanges: Array<{ date: string; change: number }>;
}

/**
 * Client component for dashboard interactivity
 *
 * @param props - Component props with pre-fetched data
 * @returns Dashboard client element
 */
export function DashboardClient({
  productsWithValues,
  evolutionData,
  monthlyWealthData,
  dailyChanges,
}: DashboardClientProps) {
  const handleDelete = async (productId: string) => {
    const result = await deleteProductAction(productId);
    if (!result.success) {
      alert(result.error || 'Failed to delete product');
    }
  };

  const stats = productsWithValues.reduce(
    (acc, product) => {
      const totalValue = product.currentValue * product.quantity;
      acc.totalValue += totalValue;
      acc.productCount += 1;

      if (product.type === 'CUSTOM') {
        acc.totalInvestment +=
          product.custom.initialInvestment * product.quantity;
      } else if (product.type === 'YAHOO_FINANCE') {
        acc.totalInvestment += product.yahoo.purchasePrice * product.quantity;
      }

      return acc;
    },
    { totalValue: 0, totalInvestment: 0, productCount: 0 },
  );

  const totalReturn = stats.totalValue - stats.totalInvestment;
  const totalReturnPercentage =
    stats.totalInvestment > 0 ? (totalReturn / stats.totalInvestment) * 100 : 0;

  const profitRates = calculateProfitRatesSync(productsWithValues);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats */}
      <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-4">
          Portfolio Overview
        </h2>
        <PortfolioStats
          totalValue={stats.totalValue}
          totalReturn={totalReturn}
          totalReturnPercentage={totalReturnPercentage}
          productCount={stats.productCount}
          profitRates={profitRates}
        />
      </div>

      {/* Monthly Wealth */}
      <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
        <MonthlyWealthChart data={monthlyWealthData} />
      </div>

      {/* Side-by-side Charts */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fade-up"
        style={{ animationDelay: '300ms' }}
      >
        <PortfolioEvolutionChart data={evolutionData} />
        <DailyChangesChart data={dailyChanges} />
      </div>

      {/* Products */}
      <div className="animate-fade-up" style={{ animationDelay: '400ms' }}>
        <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-4">
          Your Products
        </h2>
        {productsWithValues.length === 0 ? (
          <EmptyProductsState />
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
      </div>
    </div>
  );
}

/**
 * Empty state when no products exist
 *
 * @returns Empty state element
 */
function EmptyProductsState() {
  return (
    <div className="text-center py-16 glass-card rounded-2xl border border-border bg-card">
      <p className="text-muted-foreground mb-4">
        No products yet. Add your first product to get started!
      </p>
      <Link
        href="/products/add"
        className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
      >
        Add Product
      </Link>
    </div>
  );
}
