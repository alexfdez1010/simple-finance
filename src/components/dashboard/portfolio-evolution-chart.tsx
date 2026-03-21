/**
 * Portfolio evolution area chart with day range selector
 * @module components/dashboard/portfolio-evolution-chart
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

interface PortfolioEvolutionChartProps {
  data: Array<{ date: string; value: number }>;
}

const chartConfig = {
  value: {
    label: 'Portfolio Value',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

type DayRange = 30 | 60 | 90;

const DAY_OPTIONS: DayRange[] = [30, 60, 90];

/**
 * Formats EUR value in compact notation
 *
 * @param v - Value to format
 * @returns Formatted string
 */
function formatCompactEur(v: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(v);
}

/**
 * Portfolio Evolution Chart with Y-axis values and day range selector
 *
 * @param data - Array of date/value pairs (up to 90 days)
 * @returns Chart element
 */
export function PortfolioEvolutionChart({
  data,
}: PortfolioEvolutionChartProps) {
  const [range, setRange] = useState<DayRange>(30);

  const filteredData = useMemo(() => data.slice(-range), [data, range]);

  if (data.length === 0) {
    return (
      <Card className="glass-card border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Portfolio Evolution
          </CardTitle>
          <CardDescription>
            No data yet. Data appears after the first daily snapshot.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const firstValue = filteredData[0]?.value || 0;
  const lastValue = filteredData[filteredData.length - 1]?.value || 0;
  const change = lastValue - firstValue;
  const pct = firstValue > 0 ? ((change / firstValue) * 100).toFixed(2) : '0';
  const isPositive = change >= 0;

  const values = filteredData.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1 || maxValue * 0.05;
  const domainMin = Math.max(0, minValue - padding);
  const domainMax = maxValue + padding;

  return (
    <Card className="glass-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-lg">
              Portfolio Evolution
            </CardTitle>
            <CardDescription>Last {filteredData.length} days</CardDescription>
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
          <p className="text-xl sm:text-2xl font-bold tabular-nums">
            &euro;
            {lastValue.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p
            className={`text-sm font-semibold tabular-nums ${isPositive ? 'text-gain' : 'text-loss'}`}
          >
            {isPositive ? '+' : ''}&euro;
            {change.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            ({isPositive ? '+' : ''}
            {pct}%)
          </p>
        </div>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={filteredData} margin={{ left: 4, right: 4 }}>
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
              tickFormatter={formatCompactEur}
              domain={[domainMin, domainMax]}
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
                  formatter={(v) => [
                    `€${Number(v).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    'Value',
                  ]}
                />
              }
            />
            <Area
              dataKey="value"
              type="monotone"
              fill="var(--color-value)"
              fillOpacity={0.15}
              stroke="var(--color-value)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
