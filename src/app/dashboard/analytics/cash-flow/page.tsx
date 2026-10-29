import type { Metadata } from 'next';
import { CurrencyWorkspace } from '@/components/workspace/currency-workspace';
import { MonthlyContributionsChart } from '@/components/dashboard/monthly-contributions-chart';
import { LiquidityCurveChart } from '@/components/dashboard/liquidity-curve-chart';
import { loadCashFlowPage } from '@/lib/server/portfolio-page-data';

export const metadata: Metadata = { title: 'Cash flow · Simple Finance' };
export const revalidate = 60;

/** Loads signed contribution totals and configured liquidity horizons without snapshot reads. */
export default async function CashFlowPage() {
  const data = await loadCashFlowPage();
  return (
    <CurrencyWorkspace
      rates={data.rates}
      title="Cash flow & liquidity"
      description="Review your deposits and withdrawals, and when your investments can become cash"
    >
      <MonthlyContributionsChart data={data.monthlyContributions} />
      <LiquidityCurveChart data={data.liquidityCurve} />
    </CurrencyWorkspace>
  );
}
