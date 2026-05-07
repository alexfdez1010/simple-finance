/**
 * Allocation by asset category: portfolio split by high-level asset class
 * (stocks, bonds & loans, commodities, real estate, cash). Complements the
 * per-product and per-currency views.
 * @module components/dashboard/allocation-by-category-chart
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
import {
  assetCategoryLabel,
  type AssetCategory,
} from '@/lib/domain/models/asset-category';

interface CategoryAllocationItem {
  category: AssetCategory;
  value: number;
}

interface AllocationByCategoryChartProps {
  data: CategoryAllocationItem[];
}

const chartConfig = {
  value: { label: 'Value', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const CATEGORY_COLORS: Record<AssetCategory, string> = {
  STOCKS: 'oklch(0.6 0.15 250)',
  BONDS_LOANS: 'oklch(0.6 0.13 145)',
  COMMODITIES: 'oklch(0.7 0.16 60)',
  REAL_ESTATE: 'oklch(0.55 0.12 30)',
  CASH: 'oklch(0.65 0.05 200)',
};

/**
 * Horizontal bar chart of holdings grouped by asset category.
 *
 * @param props - Component props with grouped values
 * @returns Chart element
 */
export function AllocationByCategoryChart({
  data,
}: AllocationByCategoryChartProps) {
  const { format } = useDisplayCurrency();

  const enriched = useMemo(() => {
    const total = data.reduce((s, d) => s + d.value, 0);
    return data.map((d) => ({
      ...d,
      label: assetCategoryLabel(d.category),
      pct: total > 0 ? (d.value / total) * 100 : 0,
    }));
  }, [data]);

  if (enriched.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Allocation by Category
          </CardTitle>
          <CardDescription>
            Add a product to see your asset-class split.
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
          Allocation by Category
        </CardTitle>
        <CardDescription>Asset-class split of your holdings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-xl sm:text-2xl font-bold tabular-nums">
            {dominant.label}{' '}
            <span className="text-muted-foreground text-sm font-medium">
              {dominant.pct.toFixed(0)}%
            </span>
          </p>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {enriched.length} categories · top {format(dominant.value)}
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
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={110}
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
                <Cell key={`c-${i}`} fill={CATEGORY_COLORS[d.category]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
