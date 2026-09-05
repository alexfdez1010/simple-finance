/** HeroUI navigation and content presentation for the dashboard. */
'use client';

import { Tabs } from '@heroui/react';
import { DashboardChartsGrid } from '@/components/dashboard/dashboard-charts-grid';
import { PortfolioInsights } from '@/components/dashboard/portfolio-insights';
import { PortfolioStats } from '@/components/dashboard/portfolio-stats';
import { SkillTab } from '@/components/dashboard/skill-tab';
import { ProductsPanel } from '@/components/dashboard/products-panel';
import type { DashboardChartsGridProps } from '@/components/dashboard/dashboard-charts-grid';
import type { ProfitRates } from '@/lib/domain/services/profit-rate-calculator';
import type {
  FinancialProduct,
  ProductWithValue,
} from '@/lib/domain/models/product.types';

export interface DashboardTabsProps {
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
    latestChangeDate?: string;
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
          className="mb-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Portfolio Overview
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          The big picture. Every holding, working together.
        </p>
        <PortfolioStats {...stats} />
      </section>

      <PortfolioInsights holdings={products} />
      <Tabs defaultSelectedKey="charts" variant="secondary">
        <Tabs.ListContainer className="mx-auto mb-5 w-fit max-w-full overflow-x-auto rounded-2xl border-white/80 bg-white/55 p-2 shadow-sm backdrop-blur-xl">
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
