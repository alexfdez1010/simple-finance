/**
 * Dashboard charts grid: arranges every chart on the "Charts" tab. Lives in
 * its own file to keep dashboard-client.tsx under the 200-line limit.
 * @module components/dashboard/dashboard-charts-grid
 */

'use client';

import type { computePortfolioRisk } from '@/lib/domain/services/portfolio-risk';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { LiquidityCurveChart } from '@/components/dashboard/liquidity-curve-chart';
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

export interface DashboardChartsGridProps {
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
  allocationData: AllocationItem[];
  currencyAllocation: Array<{ currency: string; value: number }>;
  categoryAllocation: Array<{ category: AssetCategory; value: number }>;
  liquidityCurve: Array<{ days: number; cash: number }>;
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
  monthlyContributions,
  investedSeries,
  riskData,
  allocationData,
  currencyAllocation,
  categoryAllocation,
  liquidityCurve,
  performersData,
}: DashboardChartsGridProps) {
  const [view, setView] = useState('Overview');
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Portfolio analytics
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Explore your growth, allocation, and cash flow.
          </p>
        </div>
        <div
          className="flex flex-wrap gap-1"
          role="group"
          aria-label="Analytics view"
        >
          {['Overview', 'Allocation', 'Cash flow', 'Risk'].map((option) => (
            <Button
              key={option}
              size="sm"
              variant={view === option ? 'default' : 'ghost'}
              aria-pressed={view === option}
              onClick={() => setView(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
      {view === 'Overview' && (
        <>
          <PortfolioEvolutionChart data={evolutionData} />
          <MonthlyWealthChart data={monthlyWealthData} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopPerformers performers={performersData} />
            <InvestedVsValueChart
              evolution={evolutionData}
              invested={investedSeries}
            />
          </div>
        </>
      )}
      {view === 'Cash flow' && (
        <>
          <MonthlyContributionsChart data={monthlyContributions} />
          <LiquidityCurveChart data={liquidityCurve} />
        </>
      )}
      {view === 'Risk' && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DailyChangesChart data={riskData.dailyChanges} />
            <RollingReturnChart data={riskData.performance} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DrawdownChart data={riskData.performance} />
            <ReturnsDistributionChart data={riskData.performance} />
          </div>
          <DailyHeatmapChart data={riskData.performance} />
          <p className="text-xs text-muted-foreground">
            Returns exclude recorded deposits and withdrawals, assuming cash
            flows occur at the end of each snapshot period.
          </p>
        </>
      )}
      {view === 'Allocation' && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PortfolioAllocationChart data={allocationData} />
            <AllocationByCategoryChart data={categoryAllocation} />
          </div>

          <AllocationByCurrencyChart data={currencyAllocation} />

          <ContributionChart data={performersData} />
        </>
      )}
    </div>
  );
}
