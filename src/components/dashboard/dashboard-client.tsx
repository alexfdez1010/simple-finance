/** Dashboard client component with lazy-loaded charts and dialog management */
'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/products/product-card';
import { PortfolioStats } from '@/components/dashboard/portfolio-stats';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { AddProductDialog } from '@/components/products/add-product-dialog';
import { EditProductDialog } from '@/components/products/edit-product-dialog';
import { DeleteProductDialog } from '@/components/products/delete-product-dialog';
import { deleteProductAction } from '@/lib/actions/product-actions';
import { calculateProfitRatesSync } from '@/lib/domain/services/profit-rate-calculator';
import { computeDashboardData } from '@/lib/domain/services/dashboard-data';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MonthlyWealthChart } from '@/components/dashboard/monthly-wealth-chart';
import { PortfolioEvolutionChart } from '@/components/dashboard/portfolio-evolution-chart';
import { DailyChangesChart } from '@/components/dashboard/daily-changes-chart';
import { PortfolioAllocationChart } from '@/components/dashboard/portfolio-allocation-chart';
import { TopPerformers } from '@/components/dashboard/top-performers';
import { ContributionChart } from '@/components/dashboard/contribution-chart';
import { DrawdownChart } from '@/components/dashboard/drawdown-chart';
import { ReturnsDistributionChart } from '@/components/dashboard/returns-distribution-chart';
import { DailyHeatmapChart } from '@/components/dashboard/daily-heatmap-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DisplayCurrencyProvider } from '@/components/dashboard/display-currency-context';
import { SkillTab } from '@/components/dashboard/skill-tab';
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
  displayRates,
  skill,
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
    if (!result.success) console.error(result.error || 'Failed to delete');
    setDeleteTarget(null);
  };

  const openAddDialog = (tab: 'yahoo' | 'custom') => {
    setAddDialogTab(tab);
    setAddDialogOpen(true);
  };

  const { stats, allocationData, performersData, dailyChange } =
    computeDashboardData(productsWithValues, dailyChanges);
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
      <div className="flex flex-col gap-6 sm:gap-8">
        <Section delay="100ms" title="Portfolio Overview">
          <PortfolioStats
            totalValue={stats.totalValue}
            totalReturn={totalReturn}
            totalReturnPercentage={totalReturnPct}
            totalInvestment={stats.totalInvestment}
            productCount={stats.productCount}
            profitRates={profitRates}
            dailyChange={dailyChange}
          />
        </Section>

        <Tabs
          defaultValue="charts"
          className="animate-fade-up"
          style={{ animationDelay: '200ms' }}
        >
          <TabsList className="mx-auto mb-4 h-12 rounded-xl p-1.5">
            <TabsTrigger
              value="charts"
              className="px-8 text-base font-semibold"
            >
              Charts
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="px-8 text-base font-semibold"
            >
              Products
            </TabsTrigger>
            <TabsTrigger value="skill" className="px-8 text-base font-semibold">
              Skill
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="flex flex-col gap-6 sm:gap-8">
            <MonthlyWealthChart data={monthlyWealthData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <PortfolioEvolutionChart data={evolutionData} />
              <DailyChangesChart data={dailyChanges} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <PortfolioAllocationChart data={allocationData} />
              <TopPerformers performers={performersData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ContributionChart data={performersData} />
              <DrawdownChart data={evolutionData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ReturnsDistributionChart data={evolutionData} />
              <DailyHeatmapChart data={evolutionData} />
            </div>
          </TabsContent>

          <TabsContent value="skill">
            <SkillTab
              serverUrl={skill.serverUrl}
              token={skill.token}
              mcpJson={skill.mcpJson}
              tokenEnvVar={skill.tokenEnvVar}
            />
          </TabsContent>

          <TabsContent value="products">
            {productsWithValues.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl bg-card">
                <p className="text-muted-foreground mb-4">
                  No products yet. Add your first product to get started!
                </p>
                <Button
                  onClick={() => openAddDialog('yahoo')}
                  className="rounded-xl"
                >
                  <Plus data-icon="inline-start" />
                  Add Product
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsWithValues.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currentValue={product.currentValue}
                    currentValueEur={product.currentValueEur}
                    investedEur={product.investedEur}
                    onEdit={setEditProduct}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

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
    </DisplayCurrencyProvider>
  );
}

/** Section wrapper with title and animation delay */
function Section({
  delay,
  title,
  children,
}: {
  delay: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up" style={{ animationDelay: delay }}>
      <div className="mb-5 flex items-baseline gap-4">
        <h2 className="font-serif text-2xl sm:text-3xl text-foreground tracking-tight">
          {title}
        </h2>
        <div className="flex-1 hairline" />
      </div>
      {children}
    </div>
  );
}
