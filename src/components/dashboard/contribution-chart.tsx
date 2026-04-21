/**
 * Contribution-to-return chart: absolute P&L per product (diverging bars).
 * Complements TopPerformers (ranked by %) by showing €-impact on total return.
 * @module components/dashboard/contribution-chart
 */

'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';

interface ContributionItem {
  name: string;
  returnValue: number;
}

interface ContributionChartProps {
  data: ContributionItem[];
}

const chartConfig = {
  returnValue: { label: 'Contribution', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const GAIN_COLOR = 'oklch(0.55 0.17 155)';
const LOSS_COLOR = 'oklch(0.55 0.20 25)';

/**
 * Diverging horizontal bar chart of absolute P&L per product.
 *
 * @param props - Component props with per-product return values (EUR)
 * @returns Chart element
 */
export function ContributionChart({ data }: ContributionChartProps) {
  const { format } = useDisplayCurrency();

  const sorted = useMemo(
    () =>
      [...data]
        .filter((d) => d.returnValue !== 0)
        .sort((a, b) => Math.abs(b.returnValue) - Math.abs(a.returnValue))
        .slice(0, 10),
    [data],
  );

  if (sorted.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Contribution to Return
          </CardTitle>
          <CardDescription>
            No gains or losses yet. Add products with returns.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const net = sorted.reduce((s, d) => s + d.returnValue, 0);
  const gainers = sorted.filter((d) => d.returnValue > 0).length;
  const losers = sorted.filter((d) => d.returnValue < 0).length;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg">
          Contribution to Return
        </CardTitle>
        <CardDescription>Absolute P&amp;L per product</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p
            className={`text-xl sm:text-2xl font-bold tabular-nums ${net >= 0 ? 'text-gain' : 'text-loss'}`}
          >
            {net >= 0 ? '+' : ''}
            {format(net)}
          </p>
          <div className="flex gap-3 text-xs font-medium">
            <span className="text-gain">{gainers} gainers</span>
            <span className="text-loss">{losers} losers</span>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ left: 4, right: 12, top: 4, bottom: 4 }}
          >
            <CartesianGrid horizontal={false} strokeOpacity={0.3} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => format(Number(v), { compact: true })}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={100}
              tick={{ fontSize: 11 }}
              tickFormatter={(v: string) =>
                v.length > 14 ? `${v.slice(0, 13)}…` : v
              }
            />
            <ReferenceLine x={0} stroke="var(--border)" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(v) => {
                    const n = Number(v);
                    const prefix = n >= 0 ? '+' : '';
                    return [`${prefix}${format(n)}`, 'P&L'];
                  }}
                />
              }
            />
            <Bar dataKey="returnValue" radius={4}>
              {sorted.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.returnValue >= 0 ? GAIN_COLOR : LOSS_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
