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
  data: Array<{
    date: string;
    change: number;
  }>;
}

const chartConfig = {
  change: {
    label: 'Daily Change',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

/**
 * Daily Changes Chart Component
 * Displays the day-to-day change in portfolio value using a bar chart.
 * Positive changes are shown in green, negative in red.
 *
 * @param data - Array of date/change pairs calculated from snapshots
 */
export function DailyChangesChart({ data }: DailyChangesChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Changes</CardTitle>
          <CardDescription>
            No historical data available yet. Data will appear after at least 2
            daily snapshots.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalChange = data.reduce((sum, item) => sum + item.change, 0);
  const positiveChanges = data.filter((item) => item.change > 0).length;
  const negativeChanges = data.filter((item) => item.change < 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Changes</CardTitle>
        <CardDescription>
          Day-to-day portfolio value changes over the last {data.length} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Total Change</p>
            <p
              className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            >
              {totalChange >= 0 ? '+' : ''}€
              {totalChange.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Positive Days</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {positiveChanges}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Negative Days</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {negativeChanges}
            </p>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart
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
                  formatter={(value) => {
                    const numValue = Number(value);
                    const prefix = numValue >= 0 ? '+' : '';
                    return [
                      `${prefix}€${numValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      'Daily Change',
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
                      ? 'hsl(142, 76%, 36%)' // Green for positive
                      : 'hsl(0, 84%, 60%)' // Red for negative
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
