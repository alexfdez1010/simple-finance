/**
 * Rolling return chart: trailing N-day percentage return, computed from the
 * portfolio evolution series. Smooths daily noise and reveals momentum
 * regime — different from DailyChanges (single-day delta), Drawdown
 * (peak-relative), and ReturnsDistribution (histogram, no time axis).
 * @module components/dashboard/rolling-return-chart
 */

'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
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

interface RollingReturnChartProps {
  data: Array<{ date: string; value: number }>;
}

const chartConfig = {
  rolling: { label: 'Rolling return', color: 'var(--chart-1)' },
} satisfies ChartConfig;

type Window = 7 | 14 | 30;
const WINDOW_OPTIONS: Window[] = [7, 14, 30];

/**
 * Computes trailing-window percentage return for each available point.
 *
 * @param series - Sorted date/value pairs
 * @param window - Trailing window length in days
 * @returns Array of date/return% points (omits points without enough history)
 */
function computeRolling(
  series: Array<{ date: string; value: number }>,
  window: Window,
): Array<{ date: string; rolling: number }> {
  const out: Array<{ date: string; rolling: number }> = [];
  for (let i = window; i < series.length; i++) {
    const past = series[i - window].value;
    const now = series[i].value;
    if (past > 0)
      out.push({ date: series[i].date, rolling: ((now - past) / past) * 100 });
  }
  return out;
}

/**
 * Trailing rolling-return area chart with window selector.
 *
 * @param props - Component props with portfolio evolution data
 * @returns Chart element
 */
export function RollingReturnChart({ data }: RollingReturnChartProps) {
  const [window, setWindow] = useState<Window>(7);

  const series = useMemo(() => computeRolling(data, window), [data, window]);

  if (series.length < 2) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Rolling Return</CardTitle>
          <CardDescription>
            Needs more daily snapshots than the selected window.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const last = series[series.length - 1].rolling;
  const best = series.reduce(
    (m, p) => (p.rolling > m ? p.rolling : m),
    -Infinity,
  );
  const worst = series.reduce(
    (m, p) => (p.rolling < m ? p.rolling : m),
    Infinity,
  );
  const positive = last >= 0;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-lg">Rolling Return</CardTitle>
            <CardDescription>Trailing {window}-day % return</CardDescription>
          </div>
          <div className="flex gap-1">
            {WINDOW_OPTIONS.map((w) => (
              <Button
                key={w}
                variant={window === w ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setWindow(w)}
                disabled={data.length <= w}
              >
                {w}d
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p
            className={`text-xl sm:text-2xl font-bold tabular-nums ${positive ? 'text-gain' : 'text-loss'}`}
          >
            {positive ? '+' : ''}
            {last.toFixed(2)}%
          </p>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            best <span className="text-gain">+{best.toFixed(2)}%</span> · worst{' '}
            <span className="text-loss">{worst.toFixed(2)}%</span>
          </span>
        </div>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={series} margin={{ left: 4, right: 4 }}>
            <defs>
              <linearGradient id="rolling-gain" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="oklch(0.55 0.17 155)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="oklch(0.55 0.17 155)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
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
              width={50}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${Number(v).toFixed(1)}%`}
            />
            <ReferenceLine y={0} stroke="var(--border)" />
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
                  formatter={(v) => {
                    const n = Number(v);
                    const sign = n >= 0 ? '+' : '';
                    return [`${sign}${n.toFixed(2)}%`, 'Return'];
                  }}
                />
              }
            />
            <Area
              dataKey="rolling"
              type="monotone"
              fill="url(#rolling-gain)"
              stroke="var(--color-rolling)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
