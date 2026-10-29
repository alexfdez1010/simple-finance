import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
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
      description="Your balance, performance, and positions at a glance"
      actions={
        <Link
          href="/dashboard/portfolio"
          prefetch={false}
          className="group inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
        >
          Manage holdings
          <ArrowUpRight
            aria-hidden
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      }
    >
      <PortfolioStats {...data.stats} />
      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <PortfolioEvolutionChart data={data.evolutionData} />
        <AllocationByCategoryChart data={data.allocationData} />
      </div>
      <HoldingsPreview products={data.products} />
      <PortfolioInsights holdings={data.products} />
      <Link
        href="/dashboard/analytics"
        prefetch={false}
        className="group inline-flex min-h-11 items-center gap-3 text-[13px] font-medium text-primary"
      >
        Explore all portfolio analytics
        <ArrowRight
          aria-hidden
          size={17}
          className="transition-transform group-hover:translate-x-1"
        />
      </Link>
    </CurrencyWorkspace>
  );
}
