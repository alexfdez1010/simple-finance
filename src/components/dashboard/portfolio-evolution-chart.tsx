/**
 * Portfolio evolution area chart component
 * @module components/dashboard/portfolio-evolution-chart
 */

'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
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

interface PortfolioEvolutionChartProps {
  data: Array<{ date: string; value: number }>;
}

const chartConfig = {
  value: {
    label: 'Portfolio Value',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

/**
 * Portfolio Evolution Chart Component
 * Displays total portfolio value over time using an area chart
 *
 * @param data - Array of date/value pairs for the last 30 days
 * @returns Chart element
 */
export function PortfolioEvolutionChart({
  data,
}: PortfolioEvolutionChartProps) {
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

  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const change = lastValue - firstValue;
  const pct = firstValue > 0 ? ((change / firstValue) * 100).toFixed(2) : '0';
  const isPositive = change >= 0;

  return (
    <Card className="glass-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg">
          Portfolio Evolution
        </CardTitle>
        <CardDescription>Last {data.length} days</CardDescription>
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
          <AreaChart data={data} margin={{ left: 4, right: 4 }}>
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
