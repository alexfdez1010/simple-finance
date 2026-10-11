/**
 * Returns distribution histogram: bins arithmetic daily % returns on a
 * symmetric-log (asinh) axis so tail outliers don't stretch the central
 * bins. Highlights mean + 5th-percentile (VaR₅).
 * @module components/dashboard/returns-distribution-chart
 */

'use client';

import { useMemo } from 'react';
import { computeReturnDistribution } from './returns-distribution-data';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
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

interface ReturnsDistributionChartProps {
  data: Array<{ date: string; value: number }>;
}

const chartConfig = {
  count: { label: 'Days', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const GAIN_COLOR = 'oklch(0.55 0.17 155)';
const LOSS_COLOR = 'oklch(0.55 0.20 25)';
/**
 * Histogram of daily percent returns with tail-risk metrics.
 *
 * @param props - Component props with daily portfolio evolution data
 * @returns Chart element
 */
export function ReturnsDistributionChart({
  data,
}: ReturnsDistributionChartProps) {
  const { bins, mean, var5, hitRate, sample } = useMemo(
    () => computeReturnDistribution(data),
    [data],
  );

  if (sample < 5) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Returns Distribution
          </CardTitle>
          <CardDescription>
            Needs at least 5 daily snapshots to build a distribution.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg">
          Returns Distribution
        </CardTitle>
        <CardDescription>
          Shape of daily % returns · symlog scale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p
            className={`text-xl sm:text-2xl font-bold tabular-nums ${hitRate >= 50 ? 'text-gain' : 'text-loss'}`}
          >
            {hitRate.toFixed(0)}% hit-rate
          </p>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            μ {mean >= 0 ? '+' : ''}
            {mean.toFixed(2)}% · VaR₅{' '}
            <span className="text-loss">{var5.toFixed(2)}%</span> · n={sample}
          </span>
        </div>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={bins} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.3} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              minTickGap={24}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={30}
              tick={{ fontSize: 11 }}
              allowDecimals={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(v) => [`${v} days`, 'Count']}
                />
              }
            />
            <Bar
              isAnimationActive={false}
              dataKey="count"
              radius={[4, 4, 0, 0]}
            >
              {bins.map((b, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={b.mid >= 0 ? GAIN_COLOR : LOSS_COLOR}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
