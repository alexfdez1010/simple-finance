'use client';

import { useMemo } from 'react';
import { ChartDonut } from '@phosphor-icons/react';
import { Cell, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useDisplayCurrency } from './display-currency-context';
import {
  assetCategoryLabel,
  type AssetCategory,
} from '@/lib/domain/models/asset-category';

interface CategoryAllocationItem {
  category: AssetCategory;
  value: number;
}

const chartConfig = {
  value: { label: 'Value', color: 'var(--chart-1)' },
} satisfies ChartConfig;
const CATEGORY_COLORS: Record<AssetCategory, string> = {
  STOCKS: 'var(--chart-1)',
  BONDS_LOANS: 'var(--chart-2)',
  COMMODITIES: 'var(--chart-3)',
  REAL_ESTATE: 'var(--chart-4)',
  CASH: 'var(--chart-5)',
};

/**
 * Shows category composition with a proportional ring and a complete value ledger.
 * @param props - EUR valuations grouped by persisted asset category.
 * @returns Accessible amounts and shares; signed or zero totals omit the ring.
 * Formatting follows the display preference; supplied values are never changed.
 */
export function AllocationByCategoryChart({
  data,
}: {
  data: CategoryAllocationItem[];
}) {
  const { format } = useDisplayCurrency();
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const canChart = total > 0 && data.every((item) => item.value >= 0);
  const enriched = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        label: assetCategoryLabel(item.category),
        pct: canChart ? (item.value / total) * 100 : null,
      })),
    [data, total, canChart],
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Allocation by Category</CardTitle>
        <CardDescription>Asset-class split of your holdings</CardDescription>
      </CardHeader>
      <CardContent>
        {enriched.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/8 text-primary">
              <ChartDonut aria-hidden size={28} weight="light" />
            </span>
            <p className="text-sm font-medium">
              Make room for your first investment
            </p>
            <p className="max-w-64 text-xs leading-relaxed text-muted-foreground">
              Add a product to see your asset-class split.
            </p>
          </div>
        ) : (
          <>
            {canChart ? (
              <div className="relative mx-auto my-1 h-48 w-48">
                <ChartContainer
                  config={chartConfig}
                  className="chart-reveal h-full w-full"
                  aria-label="Allocation by asset category"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          nameKey="label"
                          hideLabel
                          formatter={(value, _name, item) => [
                            format(Number(value)),
                            item.payload.label,
                          ]}
                        />
                      }
                    />
                    <Pie
                      data={enriched}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={65}
                      outerRadius={86}
                      paddingAngle={
                        enriched.filter((item) => item.value > 0).length > 1
                          ? 4
                          : 0
                      }
                      cornerRadius={5}
                      stroke="none"
                      isAnimationActive={false}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {enriched.map((item) => (
                        <Cell
                          key={item.category}
                          fill={CATEGORY_COLORS[item.category]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
                >
                  <p className="display-number text-3xl font-semibold">
                    {enriched.length}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    asset {enriched.length === 1 ? 'class' : 'classes'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="my-6 text-xs leading-relaxed text-muted-foreground">
                Percentage breakdown unavailable for zero or signed valuations.
              </p>
            )}
            <ul className="mt-3 space-y-3" aria-label="Category values">
              {enriched.map((item) => (
                <li
                  key={item.category}
                  className="flex min-w-0 items-center gap-2.5 text-xs"
                >
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                  />
                  <span className="min-w-0 flex-1 text-muted-foreground [overflow-wrap:anywhere]">
                    {item.label}
                  </span>
                  <span className="font-medium tabular-nums [overflow-wrap:anywhere]">
                    {format(item.value, { compact: true })}
                  </span>
                  <span className="w-12 shrink-0 text-right tabular-nums text-muted-foreground">
                    {item.pct === null ? '—' : `${item.pct.toFixed(1)}%`}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
