/** Dashboard client component with lazy-loaded charts and dialog management */
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ProductCard } from '@/components/products/product-card';
import { PortfolioStats } from '@/components/dashboard/portfolio-stats';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { AddProductDialog } from '@/components/products/add-product-dialog';
import { EditProductDialog } from '@/components/products/edit-product-dialog';
import { DeleteProductDialog } from '@/components/products/delete-product-dialog';
import { deleteProductAction } from '@/lib/actions/product-actions';
import { calculateProfitRatesSync } from '@/lib/domain/services/profit-rate-calculator';
import { ChartLoadingSkeleton } from '@/components/dashboard/loading-skeletons';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type {
  ProductWithValue,
  FinancialProduct,
} from '@/lib/domain/models/product.types';

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
 * Client component for dashboard interactivity and dialog management
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogTab, setAddDialogTab] = useState<'yahoo' | 'custom'>('yahoo');
  const [editProduct, setEditProduct] = useState<FinancialProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinancialProduct | null>(
    null,
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await deleteProductAction(deleteTarget.id);
    if (!result.success) {
      console.error(result.error || 'Failed to delete product');
    }
    setDeleteTarget(null);
  };

  const openAddDialog = (tab: 'yahoo' | 'custom') => {
    setAddDialogTab(tab);
    setAddDialogOpen(true);
  };

  const stats = productsWithValues.reduce(
    (acc, p) => {
      acc.totalValue += p.currentValue * p.quantity;
      acc.productCount += 1;
      acc.totalInvestment +=
        (p.type === 'CUSTOM'
          ? p.custom.initialInvestment
          : p.yahoo.purchasePrice) * p.quantity;
      return acc;
    },
    { totalValue: 0, totalInvestment: 0, productCount: 0 },
  );
  const totalReturn = stats.totalValue - stats.totalInvestment;
  const totalReturnPct =
    stats.totalInvestment > 0 ? (totalReturn / stats.totalInvestment) * 100 : 0;
  const profitRates = calculateProfitRatesSync(productsWithValues);

  return (
    <>
      <DashboardHeader
        onAddYahoo={() => openAddDialog('yahoo')}
        onAddCustom={() => openAddDialog('custom')}
      />

      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Stats */}
        <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <h2 className="font-serif text-xl sm:text-2xl text-foreground mb-4">
            Portfolio Overview
          </h2>
          <PortfolioStats
            totalValue={stats.totalValue}
            totalReturn={totalReturn}
            totalReturnPercentage={totalReturnPct}
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
            <EmptyProductsState onAdd={() => openAddDialog('yahoo')} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsWithValues.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currentValue={product.currentValue}
                  onEdit={setEditProduct}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        defaultTab={addDialogTab}
      />
      <EditProductDialog
        open={!!editProduct}
        onOpenChange={(open) => !open && setEditProduct(null)}
        product={editProduct}
      />
      <DeleteProductDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        productName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

/** Empty state when no products exist */
function EmptyProductsState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-16 glass-card rounded-2xl border border-border bg-card">
      <p className="text-muted-foreground mb-4">
        No products yet. Add your first product to get started!
      </p>
      <Button onClick={onAdd} className="rounded-xl">
        <Plus data-icon="inline-start" />
        Add Product
      </Button>
    </div>
  );
}
