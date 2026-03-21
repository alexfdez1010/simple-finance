/**
 * Daily portfolio changes bar chart component
 * @module components/dashboard/daily-changes-chart
 */

'use client';

import { Bar, BarChart, CartesianGrid, XAxis, Cell } from 'recharts';
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

interface DailyChangesChartProps {
  data: Array<{ date: string; change: number }>;
}

const chartConfig = {
  change: {
    label: 'Daily Change',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

/**
 * Daily Changes Chart Component
 * Displays day-to-day portfolio value changes. Green = positive, red = negative.
 *
 * @param data - Array of date/change pairs from snapshots
 * @returns Chart element
 */
export function DailyChangesChart({ data }: DailyChangesChartProps) {
  if (data.length === 0) {
    return (
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Daily Changes</CardTitle>
          <CardDescription>
            No data yet. Needs at least 2 daily snapshots.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalChange = data.reduce((sum, item) => sum + item.change, 0);
  const positiveCount = data.filter((d) => d.change > 0).length;
  const negativeCount = data.filter((d) => d.change < 0).length;

  return (
    <Card className="glass-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg">Daily Changes</CardTitle>
        <CardDescription>Last {data.length} days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p
            className={`text-xl sm:text-2xl font-bold tabular-nums ${totalChange >= 0 ? 'text-gain' : 'text-loss'}`}
          >
            {totalChange >= 0 ? '+' : ''}&euro;
            {totalChange.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <div className="flex gap-3 text-xs font-medium">
            <span className="text-gain">{positiveCount} up</span>
            <span className="text-loss">{negativeCount} down</span>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={data} margin={{ left: 4, right: 4 }}>
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
                    const prefix = n >= 0 ? '+' : '';
                    return [
                      `${prefix}€${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      'Change',
                    ];
                  }}
                />
              }
            />
            <Bar dataKey="change" radius={4}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.change >= 0
                      ? 'oklch(0.55 0.17 155)' // gain green
                      : 'oklch(0.55 0.20 25)' // loss red
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
