import type { Metadata } from 'next';
import { CurrencyWorkspace } from '@/components/workspace/currency-workspace';
import { PortfolioAllocationChart } from '@/components/dashboard/portfolio-allocation-chart';
import { AllocationByCategoryChart } from '@/components/dashboard/allocation-by-category-chart';
import { AllocationByCurrencyChart } from '@/components/dashboard/allocation-by-currency-chart';
import { ContributionChart } from '@/components/dashboard/contribution-chart';
import { loadAllocationPage } from '@/lib/server/portfolio-page-data';

export const metadata: Metadata = { title: 'Allocation · Simple Finance' };
export const revalidate = 60;

/** Loads present-day allocation from holdings; does not fetch historical snapshots. */
export default async function AllocationPage() {
  const data = await loadAllocationPage();
  return (
    <CurrencyWorkspace
      rates={data.rates}
      title="Portfolio allocation"
      description="See where your capital is invested, by position, asset class, and currency."
    >
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <PortfolioAllocationChart data={data.allocationData} />
        <AllocationByCategoryChart data={data.categoryAllocation} />
      </div>
      <AllocationByCurrencyChart data={data.currencyAllocation} />
      <ContributionChart data={data.performersData} />
    </CurrencyWorkspace>
  );
}
