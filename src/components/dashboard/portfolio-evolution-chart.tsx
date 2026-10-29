/**
 * Portfolio evolution area chart with day range selector
 * @module components/dashboard/portfolio-evolution-chart
 */

'use client';

import { useMemo, useState } from 'react';
import { ChartLineUp } from '@phosphor-icons/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PortfolioEvolutionPlot } from './portfolio-evolution-plot';
import { Button } from '@/components/ui/button';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';

interface PortfolioEvolutionChartProps {
  data: Array<{ date: string; value: number }>;
}

type DayRange = 30 | 60 | 90;

const DAY_OPTIONS: DayRange[] = [30, 60, 90];

/**
 * Shows snapshot valuations with an independently selectable observation range.
 * @param props - Dated EUR valuations; samples may be irregularly spaced.
 * @returns A chart or honest first-snapshot guidance, without data mutations.
 * Chart marks render immediately; CSS reveals the complete plot independently.
 */
export function PortfolioEvolutionChart({
  data,
}: PortfolioEvolutionChartProps) {
  const { currency, format } = useDisplayCurrency();
  const [range, setRange] = useState<DayRange>(30);

  const filteredData = useMemo(() => data.slice(-range), [data, range]);

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Portfolio Evolution</CardTitle>
          <CardDescription>
            No data yet, data appears after the first daily snapshot
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <ChartLineUp aria-hidden size={28} weight="light" />
          </span>
          <p className="text-sm font-medium">
            Give your progress a little time
          </p>
          <p className="max-w-64 text-xs leading-relaxed text-muted-foreground">
            Your daily snapshots will build a picture of how your portfolio
            changes.
          </p>
        </CardContent>
      </Card>
    );
  }

  const firstValue = filteredData[0]?.value || 0;
  const lastValue = filteredData[filteredData.length - 1]?.value || 0;
  const change = lastValue - firstValue;
  const pct = firstValue > 0 ? ((change / firstValue) * 100).toFixed(2) : '0';
  const isPositive = change >= 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Portfolio Evolution</CardTitle>
            <CardDescription>
              Latest {filteredData.length} snapshots, including cash flows
            </CardDescription>
          </div>
          <div className="flex gap-0.5 rounded-xl bg-default/70 p-1">
            {DAY_OPTIONS.map((d) => (
              <Button
                key={d}
                variant="ghost"
                size="xs"
                className={`min-h-9 px-3 ${range === d ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                aria-pressed={range === d}
                onClick={() => setRange(d)}
                disabled={data.length < d && d !== 30}
              >
                {d} pts
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          key={currency}
          className="value-change my-3 mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1"
        >
          <p className="display-number text-2xl font-semibold sm:text-[28px]">
            {format(lastValue)}
          </p>
          <p
            className={`rounded-full px-2 py-1 text-[11px] font-medium tabular-nums ${isPositive ? 'bg-gain/8 text-gain' : 'bg-loss/8 text-loss'}`}
          >
            {isPositive ? '+' : ''}
            {format(change)} ({isPositive ? '+' : ''}
            {pct}%)
          </p>
        </div>
        <PortfolioEvolutionPlot key={range} data={filteredData} />
      </CardContent>
    </Card>
  );
}
