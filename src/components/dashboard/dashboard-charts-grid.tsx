/**
 * Dashboard charts grid: arranges every chart on the "Charts" tab. Lives in
 * its own file to keep dashboard-client.tsx under the 200-line limit.
 * @module components/dashboard/dashboard-charts-grid
 */

'use client';

import { MonthlyWealthChart } from '@/components/dashboard/monthly-wealth-chart';
import { PortfolioEvolutionChart } from '@/components/dashboard/portfolio-evolution-chart';
import { DailyChangesChart } from '@/components/dashboard/daily-changes-chart';
import { PortfolioAllocationChart } from '@/components/dashboard/portfolio-allocation-chart';
import { TopPerformers } from '@/components/dashboard/top-performers';
import { ContributionChart } from '@/components/dashboard/contribution-chart';
import { DrawdownChart } from '@/components/dashboard/drawdown-chart';
import { ReturnsDistributionChart } from '@/components/dashboard/returns-distribution-chart';
import { DailyHeatmapChart } from '@/components/dashboard/daily-heatmap-chart';
import { MonthlyContributionsChart } from '@/components/dashboard/monthly-contributions-chart';
import { InvestedVsValueChart } from '@/components/dashboard/invested-vs-value-chart';
import { AllocationByCurrencyChart } from '@/components/dashboard/allocation-by-currency-chart';
import { AllocationByCategoryChart } from '@/components/dashboard/allocation-by-category-chart';
import { RollingReturnChart } from '@/components/dashboard/rolling-return-chart';
import type { AssetCategory } from '@/lib/domain/models/asset-category';

interface AllocationItem {
  name: string;
  value: number;
  type: 'YAHOO_FINANCE' | 'CUSTOM';
}

interface PerformerItem {
  name: string;
  symbol: string;
  returnPct: number;
  returnValue: number;
  type: 'YAHOO_FINANCE' | 'CUSTOM';
}

interface DashboardChartsGridProps {
  evolutionData: Array<{ date: string; value: number }>;
  monthlyWealthData: Array<{ month: string; value: number }>;
  dailyChanges: Array<{ date: string; change: number }>;
  monthlyContributions: Array<{
    month: string;
    deposits: number;
    withdrawals: number;
    net: number;
  }>;
  investedSeries: Array<{ date: string; invested: number }>;
  allocationData: AllocationItem[];
  currencyAllocation: Array<{ currency: string; value: number }>;
  categoryAllocation: Array<{ category: AssetCategory; value: number }>;
  performersData: PerformerItem[];
}

/**
 * Charts grid for the dashboard.
 *
 * @param props - Pre-computed chart datasets
 * @returns Stacked grid of chart cards
 */
export function DashboardChartsGrid({
  evolutionData,
  monthlyWealthData,
  dailyChanges,
  monthlyContributions,
  investedSeries,
  allocationData,
  currencyAllocation,
  categoryAllocation,
  performersData,
}: DashboardChartsGridProps) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <MonthlyWealthChart data={monthlyWealthData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <PortfolioEvolutionChart data={evolutionData} />
        <InvestedVsValueChart
          evolution={evolutionData}
          invested={investedSeries}
        />
      </div>

      <MonthlyContributionsChart data={monthlyContributions} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DailyChangesChart data={dailyChanges} />
        <RollingReturnChart data={evolutionData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <PortfolioAllocationChart data={allocationData} />
        <AllocationByCategoryChart data={categoryAllocation} />
      </div>

      <AllocationByCurrencyChart data={currencyAllocation} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <TopPerformers performers={performersData} />
        <ContributionChart data={performersData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DrawdownChart data={evolutionData} />
        <ReturnsDistributionChart data={evolutionData} />
      </div>

      <DailyHeatmapChart data={evolutionData} />
    </div>
  );
}
