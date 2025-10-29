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
  data: Array<{
    date: string;
    value: number;
  }>;
}

const chartConfig = {
  value: {
    label: 'Portfolio Value',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

/**
 * Portfolio Evolution Chart Component
 * Displays the total portfolio value over time using an area chart.
 *
 * @param data - Array of date/value pairs for the last 30 days
 */
export function PortfolioEvolutionChart({
  data,
}: PortfolioEvolutionChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Evolution</CardTitle>
          <CardDescription>
            No historical data available yet. Data will appear after the first
            daily snapshot.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const change = lastValue - firstValue;
  const changePercentage =
    firstValue > 0 ? ((change / firstValue) * 100).toFixed(2) : '0.00';
  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Evolution</CardTitle>
        <CardDescription>
          Total portfolio value over the last {data.length} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Current Value</p>
            <p className="text-2xl font-bold">
              €
              {lastValue.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Period Change</p>
            <p
              className={`text-2xl font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            >
              {isPositive ? '+' : ''}€
              {change.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              ({isPositive ? '+' : ''}
              {changePercentage}%)
            </p>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }}
                  formatter={(value) => [
                    `€${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    'Portfolio Value',
                  ]}
                />
              }
            />
            <Area
              dataKey="value"
              type="monotone"
              fill="var(--color-value)"
              fillOpacity={0.4}
              stroke="var(--color-value)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
