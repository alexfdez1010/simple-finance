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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';

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
  format,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonthlyWealthData; value: number }>;
  format: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-overlay p-3 shadow-sm">
      <p className="text-xs font-semibold text-foreground mb-1">
        {payload[0].payload.month}
      </p>
      <p className="text-sm font-semibold tabular-nums">
        {format(payload[0].value)}
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
  const { format } = useDisplayCurrency();
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Monthly Wealth Evolution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[250px] items-center justify-center">
          <p className="text-sm text-muted">
            No historical data available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">
          Monthly Wealth Evolution
        </CardTitle>
        <CardDescription>End-of-month portfolio value</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          aria-label="Monthly wealth evolution"
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
                tickFormatter={(v) => format(v, { compact: true })}
              />
              <Tooltip content={<CustomTooltip format={format} />} />
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
      </CardContent>
    </Card>
  );
}
