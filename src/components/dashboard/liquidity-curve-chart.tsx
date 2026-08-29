/**
 * Cash availability chart: a stepped area showing how much EUR cash the
 * portfolio can raise as the liquidity horizon (days waited) grows. Each
 * asset contributes its current value once `days` reaches its
 * `daysToLiquidity`, so the curve is the cumulative cash obtainable by a
 * given day.
 * @module components/dashboard/liquidity-curve-chart
 */

'use client';

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
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';

interface LiquidityCurveChartProps {
  data: Array<{ days: number; cash: number }>;
}

const chartConfig = {
  cash: { label: 'Available Cash', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const dayLabel = (days: number) => (days === 0 ? 'Today' : `${days}d`);

/**
 * Stepped cash-availability curve over the liquidity horizon.
 *
 * @param props - Cumulative cash points keyed by day threshold
 * @returns Chart element
 */
export function LiquidityCurveChart({ data }: LiquidityCurveChartProps) {
  const { format } = useDisplayCurrency();

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Cash Availability
          </CardTitle>
          <CardDescription>
            Add a product to see how fast you can raise cash.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const instant = data[0]?.cash ?? 0;
  const total = data[data.length - 1]?.cash ?? 0;
  const fullDays = data[data.length - 1]?.days ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg">Cash Availability</CardTitle>
        <CardDescription>
          Cumulative cash you can raise by liquidity horizon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-xl sm:text-2xl font-bold tabular-nums">
            {format(instant)}{' '}
            <span className="text-muted-foreground text-sm font-medium">
              today
            </span>
          </p>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {format(total)} in full within {fullDays}d
          </span>
        </div>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <AreaChart data={data} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.3} />
            <XAxis
              dataKey="days"
              type="number"
              domain={[0, 'dataMax']}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => dayLabel(Number(v))}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(v) => format(Number(v), { compact: true })}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_l, payload) =>
                    `After ${dayLabel(Number(payload?.[0]?.payload?.days ?? 0))}`
                  }
                  formatter={(v) => [format(Number(v)), 'Available Cash']}
                />
              }
            />
            <Area
              dataKey="cash"
              type="stepAfter"
              fill="var(--color-cash)"
              fillOpacity={0.15}
              stroke="var(--color-cash)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
