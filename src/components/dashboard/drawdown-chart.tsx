/**
 * Drawdown chart: % decline from running peak over time.
 * Risk lens — shows how deep and how long each dip was.
 * @module components/dashboard/drawdown-chart
 */

'use client';

import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

interface DrawdownChartProps {
  data: Array<{ date: string; value: number }>;
}

const chartConfig = {
  drawdown: { label: 'Drawdown', color: 'oklch(0.55 0.20 25)' },
} satisfies ChartConfig;

type DayRange = 30 | 60 | 90;
const DAY_OPTIONS: DayRange[] = [30, 60, 90];

/**
 * Computes percentage drawdown from running peak.
 *
 * @param series - Date/value pairs
 * @returns Array of date/drawdown%/peak triples
 */
function computeDrawdown(
  series: Array<{ date: string; value: number }>,
): Array<{ date: string; drawdown: number; peak: number }> {
  let peak = -Infinity;
  return series.map((d) => {
    if (d.value > peak) peak = d.value;
    const dd = peak > 0 ? ((d.value - peak) / peak) * 100 : 0;
    return { date: d.date, drawdown: dd, peak };
  });
}

/**
 * Drawdown area chart — always ≤ 0. Troughs reveal worst declines.
 *
 * @param props - Component props with portfolio evolution data
 * @returns Chart element
 */
export function DrawdownChart({ data }: DrawdownChartProps) {
  const [range, setRange] = useState<DayRange>(30);

  const ddSeries = useMemo(() => {
    const sliced = data.slice(-range);
    return computeDrawdown(sliced);
  }, [data, range]);

  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Drawdown</CardTitle>
          <CardDescription>
            No data yet. Data appears after the first daily snapshot.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const current = ddSeries[ddSeries.length - 1]?.drawdown ?? 0;
  const maxDd = ddSeries.reduce(
    (min, d) => (d.drawdown < min ? d.drawdown : min),
    0,
  );
  const atPeak = current >= -0.05;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-lg">Drawdown</CardTitle>
            <CardDescription>% below running peak</CardDescription>
          </div>
          <div className="flex gap-1">
            {DAY_OPTIONS.map((d) => (
              <Button
                key={d}
                variant={range === d ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setRange(d)}
                disabled={data.length < d && d !== 30}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p
            className={`text-xl sm:text-2xl font-bold tabular-nums ${atPeak ? 'text-gain' : 'text-loss'}`}
          >
            {atPeak ? 'At peak' : `${current.toFixed(2)}%`}
          </p>
          <p className="text-sm font-semibold text-loss tabular-nums">
            Max: {maxDd.toFixed(2)}%
          </p>
        </div>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={ddSeries} margin={{ left: 4, right: 4 }}>
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
              tickFormatter={(v) => `${Number(v).toFixed(0)}%`}
              domain={[Math.min(maxDd * 1.1, -1), 0]}
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
                  formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Drawdown']}
                />
              }
            />
            <Area
              dataKey="drawdown"
              type="monotone"
              fill="var(--color-drawdown)"
              fillOpacity={0.2}
              stroke="var(--color-drawdown)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
