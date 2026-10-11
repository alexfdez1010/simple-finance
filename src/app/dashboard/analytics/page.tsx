import type { Metadata } from 'next';
import { CurrencyWorkspace } from '@/components/workspace/currency-workspace';
import { PortfolioEvolutionChart } from '@/components/dashboard/portfolio-evolution-chart';
import { MonthlyInvestmentGainsChart } from '@/components/dashboard/monthly-investment-gains-chart';
import { MonthlyWealthChart } from '@/components/dashboard/monthly-wealth-chart';
import { TopPerformers } from '@/components/dashboard/top-performers';
import { InvestedVsValueChart } from '@/components/dashboard/invested-vs-value-chart';
import { loadGrowthPage } from '@/lib/server/portfolio-page-data';

export const metadata: Metadata = {
  title: 'Growth analytics · Simple Finance',
};
export const revalidate = 60;

/** Loads growth history and cash-flow-adjusted gains solely for the overview analytics route. */
export default async function GrowthPage() {
  const data = await loadGrowthPage();
  return (
    <CurrencyWorkspace
      rates={data.rates}
      title="Portfolio analytics"
      description="Follow your growth and distinguish investment gains from contributed capital."
    >
      <PortfolioEvolutionChart data={data.evolutionData} />
      <MonthlyInvestmentGainsChart data={data.monthlyInvestmentGains} />
      <MonthlyWealthChart data={data.monthlyWealthData} />
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <TopPerformers performers={data.performersData} />
        <InvestedVsValueChart
          evolution={data.evolutionData}
          invested={data.investedSeries}
        />
      </div>
    </CurrencyWorkspace>
  );
}
