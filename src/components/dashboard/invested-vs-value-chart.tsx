/**
 * Cost basis vs portfolio value: cumulative invested line over time,
 * overlaid with the portfolio value series. Gap = unrealised P&L.
 * @module components/dashboard/invested-vs-value-chart
 */

'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';

interface InvestedVsValueChartProps {
  evolution: Array<{ date: string; value: number }>;
  invested: Array<{ date: string; invested: number }>;
}

const chartConfig = {
  value: { label: 'Value', color: 'var(--chart-1)' },
  invested: { label: 'Invested', color: 'oklch(0.55 0.06 250)' },
} satisfies ChartConfig;

type DayRange = 30 | 60 | 90;
const DAY_OPTIONS: DayRange[] = [30, 60, 90];

/** Joins value + invested points by date for a shared X-axis. */
function mergeSeries(
  evolution: Array<{ date: string; value: number }>,
  invested: Array<{ date: string; invested: number }>,
): Array<{ date: string; value: number; invested: number }> {
  const m = new Map(invested.map((p) => [p.date, p.invested]));
  return evolution.map((p) => ({
    date: p.date,
    value: p.value,
    invested: m.get(p.date) ?? 0,
  }));
}

/**
 * Dual-series chart: cumulative invested (line) vs portfolio value (area).
 *
 * @param props - Evolution and invested-series data
 * @returns Chart element
 */
export function InvestedVsValueChart({
  evolution,
  invested,
}: InvestedVsValueChartProps) {
  const { format } = useDisplayCurrency();
  const [range, setRange] = useState<DayRange>(30);

  const series = useMemo(
    () => mergeSeries(evolution, invested).slice(-range),
    [evolution, invested, range],
  );

  if (evolution.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Invested vs Value
          </CardTitle>
          <CardDescription>
            No data yet. Data appears after the first daily snapshot.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const last = series[series.length - 1] ?? { value: 0, invested: 0 };
  const gap = last.value - last.invested;
  const pct = last.invested > 0 ? (gap / last.invested) * 100 : 0;
  const positive = gap >= 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-lg">
              Invested vs Value
            </CardTitle>
            <CardDescription>
              Cost basis next to portfolio value
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {DAY_OPTIONS.map((d) => (
              <Button
                key={d}
                variant={range === d ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setRange(d)}
                disabled={evolution.length < d && d !== 30}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-xl sm:text-2xl font-bold tabular-nums">
            {format(last.value)}
          </p>
          <p
            className={`text-sm font-semibold tabular-nums ${positive ? 'text-gain' : 'text-loss'}`}
          >
            {positive ? '+' : ''}
            {format(gap)} ({positive ? '+' : ''}
            {pct.toFixed(2)}%)
          </p>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            invested {format(last.invested)}
          </span>
        </div>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <ComposedChart data={series} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={60}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => format(Number(v), { compact: true })}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(v) =>
                    new Date(v as string).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  }
                  formatter={(v, n) => [
                    format(Number(v)),
                    n === 'value' ? 'Value' : 'Invested',
                  ]}
                />
              }
            />
            <Area
              dataKey="value"
              type="monotone"
              fill="var(--color-value)"
              fillOpacity={0.18}
              stroke="var(--color-value)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="invested"
              stroke="var(--color-invested)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
