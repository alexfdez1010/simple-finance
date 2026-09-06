/** Dashboard client component with lazy-loaded charts and dialog management */
'use client';

import type { computePortfolioRisk } from '@/lib/domain/services/portfolio-risk';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs';
import { AddProductDialog } from '@/components/products/add-product-dialog';
import { EditProductDialog } from '@/components/products/edit-product-dialog';
import { DeleteProductDialog } from '@/components/products/delete-product-dialog';
import { ProductHistoryDialog } from '@/components/products/product-history-dialog';
import { deleteProductAction } from '@/lib/actions/product-actions';
import { calculateProfitRatesSync } from '@/lib/domain/services/profit-rate-calculator';
import { computeDashboardData } from '@/lib/domain/services/dashboard-data';
import { DisplayCurrencyProvider } from '@/components/dashboard/display-currency-context';
import type { DisplayCurrency } from '@/lib/utils/format-currency';
import type {
  ProductWithValue,
  FinancialProduct,
} from '@/lib/domain/models/product.types';

interface DashboardClientProps {
  productsWithValues: ProductWithValue[];
  evolutionData: Array<{ date: string; value: number }>;
  monthlyWealthData: Array<{ month: string; value: number }>;
  dailyChanges: Array<{ date: string; change: number }>;
  monthlyContributions: Array<{
    month: string;
    deposits: number;
    withdrawals: number;
    net: number;
  }>;
  riskData: ReturnType<typeof computePortfolioRisk>;
  investedSeries: Array<{ date: string; invested: number }>;
  displayRates: Record<DisplayCurrency, number>;
  skill: {
    serverUrl: string;
    token: string;
    mcpJson: string;
    tokenEnvVar: string;
  };
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
  monthlyContributions,
  investedSeries,
  riskData,
  displayRates,
  skill,
}: DashboardClientProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogTab, setAddDialogTab] = useState<'yahoo' | 'custom'>('yahoo');
  const [editProduct, setEditProduct] = useState<FinancialProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinancialProduct | null>(
    null,
  );
  const [historyTarget, setHistoryTarget] = useState<FinancialProduct | null>(
    null,
  );

  /** Deletes the selected product and closes the confirmation dialog. */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await deleteProductAction(deleteTarget.id);
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete');
    }
    setDeleteTarget(null);
  };

  /** Opens the add dialog on the requested product source. */
  const openAddDialog = (tab: 'yahoo' | 'custom') => {
    setAddDialogTab(tab);
    setAddDialogOpen(true);
  };

  const {
    stats,
    allocationData,
    performersData,
    currencyAllocation,
    categoryAllocation,
    liquidityCurve,
    dailyChange,
  } = computeDashboardData(productsWithValues, dailyChanges);
  const totalReturn = stats.totalValue - stats.totalInvestment;
  const totalReturnPct =
    stats.totalInvestment > 0 ? (totalReturn / stats.totalInvestment) * 100 : 0;
  const profitRates = calculateProfitRatesSync(productsWithValues);

  return (
    <DisplayCurrencyProvider rates={displayRates}>
      <DashboardHeader
        onAddYahoo={() => openAddDialog('yahoo')}
        onAddCustom={() => openAddDialog('custom')}
      />
      <DashboardTabs
        products={productsWithValues}
        stats={{
          totalValue: stats.totalValue,
          totalReturn,
          totalReturnPercentage: totalReturnPct,
          totalInvestment: stats.totalInvestment,
          productCount: stats.productCount,
          profitRates,
          dailyChange,
          latestChangeDate: dailyChanges.at(-1)?.date,
        }}
        charts={{
          evolutionData,
          monthlyWealthData,
          dailyChanges,
          monthlyContributions,
          investedSeries,
          riskData,
          allocationData,
          currencyAllocation,
          categoryAllocation,
          liquidityCurve,
          performersData,
        }}
        skill={skill}
        onAddProduct={() => openAddDialog('yahoo')}
        onEditProduct={setEditProduct}
        onDeleteProduct={setDeleteTarget}
        onViewProduct={setHistoryTarget}
      />

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
      <ProductHistoryDialog
        open={!!historyTarget}
        onOpenChange={(open) => !open && setHistoryTarget(null)}
        product={historyTarget}
      />
    </DisplayCurrencyProvider>
  );
}
