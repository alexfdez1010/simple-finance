/**
 * Monthly wealth chart component - shows portfolio value at the end of each month
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
 * Monthly Wealth Chart Component
 *
 * @param props - Component props
 * @returns Monthly wealth chart element
 */
export function MonthlyWealthChart({ data }: MonthlyWealthChartProps) {
  const title = (
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 px-2">
      Monthly Wealth Evolution
    </h3>
  );

  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        {title}
        <div className="h-[300px] flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">
            No historical data available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] bg-white dark:bg-slate-800 rounded-lg shadow-md px-6">
      {title}
      <ChartContainer
        className="h-[300px] w-full"
        config={{
          value: {
            label: 'Total Value',
            color: 'var(--chart-1)',
          },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              opacity={0.1}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickFormatter={(value) =>
                new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                  notation: 'compact',
                }).format(value)
              }
            />
            <Tooltip
              cursor={{ fill: 'currentColor', opacity: 0.05 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md">
                      <p className="text-sm font-semibold mb-1">
                        {payload[0].payload.month}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
                        {new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              className="fill-slate-900 dark:fill-slate-100"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  className="fill-slate-900 dark:fill-slate-100 hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
