import Link from 'next/link';
import { CurrencyWorkspace } from '@/components/workspace/currency-workspace';
import { HoldingsPreview } from '@/components/workspace/holdings-preview';
import { PortfolioStats } from '@/components/dashboard/portfolio-stats';
import { PortfolioInsights } from '@/components/dashboard/portfolio-insights';
import { PortfolioEvolutionChart } from '@/components/dashboard/portfolio-evolution-chart';
import { AllocationByCategoryChart } from '@/components/dashboard/allocation-by-category-chart';
import { loadOverviewPage } from '@/lib/server/portfolio-page-data';

export const revalidate = 60;

/**
 * Loads the home overview with a bounded recent history and focused summary.
 * @returns Balance, evolution, allocation, largest holdings, and diagnostics.
 * Reads overview data only; analytics and agent configuration load on their routes.
 */
export default async function DashboardPage() {
  const data = await loadOverviewPage();
  return (
    <CurrencyWorkspace
      rates={data.rates}
      title="Portfolio Overview"
      description="Your balance, performance, and positions at a glance."
      actions={
        <Link
          href="/dashboard/portfolio"
          prefetch={false}
          className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Manage holdings
        </Link>
      }
    >
      <PortfolioStats {...data.stats} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <PortfolioEvolutionChart data={data.evolutionData} />
        <AllocationByCategoryChart data={data.allocationData} />
      </div>
      <HoldingsPreview products={data.products} />
      <PortfolioInsights holdings={data.products} />
      <Link
        href="/dashboard/analytics"
        prefetch={false}
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
      >
        Explore all portfolio analytics
      </Link>
    </CurrencyWorkspace>
  );
}
