/**
 * Allocation by source currency: portfolio split by the underlying currency
 * each holding is denominated in (EUR / USD / BTC / ETH / XAUT). Different
 * lens from PortfolioAllocation (per-product) — surfaces FX exposure.
 * @module components/dashboard/allocation-by-currency-chart
 */

'use client';

import { useMemo } from 'react';
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
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';

interface CurrencyAllocationItem {
  currency: string;
  value: number;
}

interface AllocationByCurrencyChartProps {
  data: CurrencyAllocationItem[];
}

const chartConfig = {
  value: { label: 'Value', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const CURRENCY_COLORS: Record<string, string> = {
  EUR: 'oklch(0.6 0.13 250)',
  USD: 'oklch(0.6 0.15 145)',
  BTC: 'oklch(0.7 0.16 60)',
  ETH: 'oklch(0.55 0.12 290)',
  XAUT: 'oklch(0.7 0.13 90)',
};
const FALLBACK_COLOR = 'oklch(0.55 0.06 250)';

/**
 * Horizontal bar chart of holdings grouped by underlying currency.
 *
 * @param props - Component props with grouped values
 * @returns Chart element
 */
export function AllocationByCurrencyChart({
  data,
}: AllocationByCurrencyChartProps) {
  const { format } = useDisplayCurrency();

  const enriched = useMemo(() => {
    const total = data.reduce((s, d) => s + d.value, 0);
    return data.map((d) => ({
      ...d,
      pct: total > 0 ? (d.value / total) * 100 : 0,
    }));
  }, [data]);

  if (enriched.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Allocation by Currency
          </CardTitle>
          <CardDescription>
            Add a product to see your currency exposure.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dominant = enriched[0];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg">
          Allocation by Currency
        </CardTitle>
        <CardDescription>FX exposure per holding</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-xl sm:text-2xl font-bold tabular-nums">
            {dominant.currency}{' '}
            <span className="text-muted-foreground text-sm font-medium">
              {dominant.pct.toFixed(0)}%
            </span>
          </p>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {enriched.length} currencies · top {format(dominant.value)}
          </span>
        </div>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart
            data={enriched}
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
              dataKey="currency"
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 11, fontWeight: 600 }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(v, _n, item) => {
                    const pct = (item?.payload as { pct: number } | undefined)
                      ?.pct;
                    return [
                      `${format(Number(v))} · ${pct?.toFixed(1) ?? '0'}%`,
                      'Value',
                    ];
                  }}
                />
              }
            />
            <Bar dataKey="value" radius={4}>
              {enriched.map((d, i) => (
                <Cell
                  key={`c-${i}`}
                  fill={CURRENCY_COLORS[d.currency] ?? FALLBACK_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
