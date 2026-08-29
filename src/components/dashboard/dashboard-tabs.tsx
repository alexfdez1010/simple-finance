/** HeroUI navigation and content presentation for the dashboard. */
'use client';

import { Button, Card, Tabs } from '@heroui/react';
import { Plus } from '@phosphor-icons/react';
import { DashboardChartsGrid } from '@/components/dashboard/dashboard-charts-grid';
import { PortfolioStats } from '@/components/dashboard/portfolio-stats';
import { SkillTab } from '@/components/dashboard/skill-tab';
import { ProductCard } from '@/components/products/product-card';
import type { DashboardChartsGridProps } from '@/components/dashboard/dashboard-charts-grid';
import type { ProfitRates } from '@/lib/domain/services/profit-rate-calculator';
import type {
  FinancialProduct,
  ProductWithValue,
} from '@/lib/domain/models/product.types';

interface DashboardTabsProps {
  products: ProductWithValue[];
  charts: DashboardChartsGridProps;
  stats: {
    totalValue: number;
    totalReturn: number;
    totalReturnPercentage: number;
    totalInvestment: number;
    productCount: number;
    profitRates: ProfitRates;
    dailyChange: number;
  };
  skill: {
    serverUrl: string;
    token: string;
    mcpJson: string;
    tokenEnvVar: string;
  };
  onAddProduct: () => void;
  onEditProduct: (product: FinancialProduct) => void;
  onDeleteProduct: (product: FinancialProduct) => void;
  onViewProduct: (product: FinancialProduct) => void;
}

/**
 * Renders the portfolio summary and the three dashboard workspaces.
 *
 * @param props - Prepared data and product action callbacks.
 * @returns Accessible HeroUI tabs with charts, products, and skill details.
 */
export function DashboardTabs({
  products,
  charts,
  stats,
  skill,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onViewProduct,
}: DashboardTabsProps) {
  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="portfolio-summary-title">
        <h2
          id="portfolio-summary-title"
          className="mb-4 font-serif text-xl text-foreground"
        >
          Portfolio Overview
        </h2>
        <PortfolioStats {...stats} />
      </section>

      <Tabs defaultSelectedKey="charts" variant="secondary">
        <Tabs.ListContainer className="mb-5 overflow-x-auto">
          <Tabs.List aria-label="Dashboard sections" className="w-fit">
            <Tabs.Tab id="charts">
              Charts
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="products">
              Products
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="skill">
              Skill
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="charts">
          <DashboardChartsGrid {...charts} />
        </Tabs.Panel>
        <Tabs.Panel id="products">
          <ProductsPanel
            products={products}
            onAddProduct={onAddProduct}
            onEditProduct={onEditProduct}
            onDeleteProduct={onDeleteProduct}
            onViewProduct={onViewProduct}
          />
        </Tabs.Panel>
        <Tabs.Panel id="skill">
          <SkillTab {...skill} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

/** Renders the product grid or its empty state. */
function ProductsPanel({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onViewProduct,
}: Pick<
  DashboardTabsProps,
  | 'products'
  | 'onAddProduct'
  | 'onEditProduct'
  | 'onDeleteProduct'
  | 'onViewProduct'
>) {
  if (products.length === 0) {
    return (
      <Card className="border border-border py-0 shadow-none">
        <Card.Content className="flex min-h-52 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-sm text-muted-foreground">No products yet.</p>
          <Button onPress={onAddProduct} size="sm" variant="primary">
            <Plus aria-hidden size={16} weight="bold" />
            Add Product
          </Button>
        </Card.Content>
      </Card>
    );
  }

  return (
    <section
      aria-label="Products"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          currentValue={product.currentValue}
          currentValueEur={product.currentValueEur}
          investedEur={product.investedEur}
          expectedAnnualReturn={product.expectedAnnualReturn}
          onEdit={onEditProduct}
          onDelete={onDeleteProduct}
          onView={onViewProduct}
        />
      ))}
    </section>
  );
}
