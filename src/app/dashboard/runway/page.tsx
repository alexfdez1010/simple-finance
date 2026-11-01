import { CurrencyWorkspace } from '@/components/workspace/currency-workspace';
import { RunwayWorkspace } from '@/components/runway/runway-workspace';
import { loadRunwayPage } from '@/lib/server/runway-page-data';

/** Loads the current portfolio and shared persisted assumptions without fetching historical snapshots. */
export default async function RunwayPage() {
  const { products, rates, settings } = await loadRunwayPage();
  return (
    <CurrencyWorkspace
      rates={rates}
      title="Runway & FIRE"
      description="Monthly living costs and financial independence"
    >
      <RunwayWorkspace
        products={products.map(({ currentValueEur, expectedAnnualReturn }) => ({
          currentValueEur,
          expectedAnnualReturn,
        }))}
        settings={settings}
      />
    </CurrencyWorkspace>
  );
}
