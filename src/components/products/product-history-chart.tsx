/**
 * Recharts line chart used inside the product-history dialog. Renders an
 * "actual" line (snapshots augmented with today's live value) and a dashed
 * "projected" line for custom-product simulations. Values arrive in EUR and
 * are converted at render time via the dashboard's display-currency.
 *
 * @module components/products/product-history-chart
 */

'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';

export interface HistoryChartPoint {
  date: string;
  actual: number | null;
  projected: number | null;
}

const config = {
  actual: { label: 'Actual', color: 'var(--chart-1)' },
  projected: { label: 'Projected', color: 'var(--chart-2)' },
} satisfies ChartConfig;

interface Props {
  data: HistoryChartPoint[];
  /** Last actual point — drives the "now" reference line on the X axis. */
  splitDate: string | undefined;
}

/**
 * Line chart with a vertical "now" marker between actual and projected.
 *
 * @param props - data, splitDate
 * @returns Chart element
 */
export function ProductHistoryChart({ data, splitDate }: Props) {
  const { format } = useDisplayCurrency();
  return (
    <ChartContainer config={config} className="h-[260px] w-full">
      <LineChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} strokeOpacity={0.3} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v) =>
            new Date(v).toLocaleDateString('en-US', {
              month: 'short',
              year: '2-digit',
            })
          }
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(v) => format(Number(v), { compact: true })}
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
              formatter={(v, name) => [
                format(Number(v)),
                name === 'actual' ? 'Actual' : 'Projected',
              ]}
            />
          }
        />
        {splitDate && (
          <ReferenceLine
            x={splitDate}
            stroke="var(--border)"
            strokeDasharray="4 4"
          />
        )}
        <Line
          dataKey="actual"
          type="monotone"
          stroke="var(--color-actual)"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          dataKey="projected"
          type="monotone"
          stroke="var(--color-projected)"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  );
}
