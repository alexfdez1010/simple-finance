/**
 * Monthly wealth chart component - portfolio value at end of each month
 * @module components/dashboard/monthly-wealth-chart
 */

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface MonthlyWealthData {
  month: string;
  value: number;
}

interface MonthlyWealthChartProps {
  data: MonthlyWealthData[];
}

/**
 * Custom tooltip content for the monthly wealth chart
 *
 * @param props - Recharts tooltip props
 * @returns Tooltip element or null
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonthlyWealthData; value: number }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-card bg-card p-3 border border-border rounded-xl shadow-lg">
      <p className="text-xs font-semibold text-foreground mb-1">
        {payload[0].payload.month}
      </p>
      <p className="text-sm text-primary font-bold tabular-nums">
        {new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
        }).format(payload[0].value)}
      </p>
    </div>
  );
}

/**
 * Monthly Wealth Chart Component
 *
 * @param props - Component props
 * @returns Monthly wealth chart element
 */
export function MonthlyWealthChart({ data }: MonthlyWealthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card rounded-2xl bg-card p-5 shadow-sm border border-border">
        <h3 className="font-serif text-lg text-foreground mb-4">
          Monthly Wealth Evolution
        </h3>
        <div className="h-[250px] flex items-center justify-center border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground text-sm">
            No historical data available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl bg-card shadow-sm border border-border px-4 sm:px-6 pt-5 pb-2">
      <h3 className="font-serif text-lg text-foreground mb-4 px-1">
        Monthly Wealth Evolution
      </h3>
      <ChartContainer
        className="h-[280px] w-full"
        config={{
          value: { label: 'Total Value', color: 'var(--chart-1)' },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 16 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.15}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              width={65}
              tickFormatter={(v) =>
                new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                  notation: 'compact',
                }).format(v)
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill="var(--chart-1)"
                  fillOpacity={0.8}
                  className="hover:opacity-100 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
