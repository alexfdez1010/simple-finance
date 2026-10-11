import type { Metadata } from 'next';
import { CurrencyWorkspace } from '@/components/workspace/currency-workspace';
import { DailyChangesChart } from '@/components/dashboard/daily-changes-chart';
import { RollingReturnChart } from '@/components/dashboard/rolling-return-chart';
import { DrawdownChart } from '@/components/dashboard/drawdown-chart';
import { ReturnsDistributionChart } from '@/components/dashboard/returns-distribution-chart';
import { DailyHeatmapChart } from '@/components/dashboard/daily-heatmap-chart';
import { loadRiskPage } from '@/lib/server/portfolio-page-data';

export const metadata: Metadata = { title: 'Risk & changes · Simple Finance' };
export const revalidate = 60;

/** Loads historical risk views without enriching holdings or fetching contribution events. */
export default async function RiskPage() {
  const data = await loadRiskPage();
  return (
    <CurrencyWorkspace
      rates={data.rates}
      title="Risk & daily changes"
      description="Inspect changes in recorded portfolio values and how they vary over time."
    >
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <DailyChangesChart data={data.dailyChanges} />
        <RollingReturnChart data={data.evolutionData} />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <DrawdownChart data={data.evolutionData} />
        <ReturnsDistributionChart data={data.evolutionData} />
      </div>
      <DailyHeatmapChart data={data.evolutionData} />
      <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">
        Snapshot value changes include deposits and withdrawals; they are not
        cash-flow-adjusted investment returns.
      </p>
    </CurrencyWorkspace>
  );
}
