'use client';

import { ChartDonut, Drop, Target, TrendUp } from '@phosphor-icons/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useDisplayCurrency } from './display-currency-context';
import {
  computePortfolioInsights,
  type InsightHolding,
} from '@/lib/domain/services/portfolio-insights';

/**
 * Renders descriptive diagnostics from EUR holdings without fetching or mutation.
 * @param props - Current holdings, including liquidity and forecast metadata.
 * @returns Accessible insight cards; unknown percentages display an em dash.
 */
export function PortfolioInsights({
  holdings,
}: {
  holdings: readonly InsightHolding[];
}) {
  const insights = computePortfolioInsights(holdings);
  const { format } = useDisplayCurrency();
  const items = [
    {
      label: 'Largest position',
      value: percentage(insights.concentrationPct),
      detail: insights.largestName ?? 'Add a holding to see your allocation',
      icon: ChartDonut,
      progress: insights.concentrationPct,
    },
    {
      label: 'Available within 7 days',
      value: percentage(insights.liquidPct),
      detail: `${format(insights.liquidValue)} at current valuations`,
      icon: Drop,
      progress: insights.liquidPct,
    },
    {
      label: 'Profitable holdings',
      value: insights.comparableCount
        ? `${insights.profitableCount} / ${insights.comparableCount}`
        : '—',
      detail: 'Current value above positive invested capital',
      icon: TrendUp,
      progress: insights.comparableCount
        ? (insights.profitableCount / insights.comparableCount) * 100
        : null,
    },
    {
      label: 'Forecast coverage',
      value: percentage(insights.forecastCoveragePct),
      detail: 'Share of value with an available return estimate',
      icon: Target,
      progress: insights.forecastCoveragePct,
    },
  ];
  return (
    <Card aria-label="Portfolio insights">
      <CardHeader className="gap-1 pb-5">
        <CardTitle>Beyond the balance</CardTitle>
        <CardDescription>
          A closer look at how your portfolio is positioned.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ label, value, detail, icon: Icon, progress }) => (
            <div key={label} className="min-w-0">
              <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                <Icon size={17} aria-hidden weight="duotone" />
                <h3 className="text-xs font-medium">{label}</h3>
              </div>
              <p className="display-number text-3xl font-semibold">{value}</p>
              <progress
                aria-label={label}
                aria-hidden={progress === null}
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-primary/10 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary/70 [&::-moz-progress-bar]:bg-primary/70"
                max={100}
                value={progress ?? 0}
              />
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {detail}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-separator pt-3 text-[11px] leading-relaxed text-muted-foreground">
          Allocation and coverage use positive holding values. Liquidity uses
          your configured settlement times; sale proceeds may differ.{' '}
          {insights.excludedCount > 0 &&
            `${insights.excludedCount} holding(s) excluded due to unavailable valuations.`}
        </p>
      </CardContent>
    </Card>
  );
}

/** Formats a known percentage, preserving missing data instead of implying zero. */
function percentage(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(1)}%`;
}
