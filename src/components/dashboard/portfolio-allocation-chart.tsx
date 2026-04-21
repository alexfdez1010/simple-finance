/**
 * Portfolio allocation donut chart showing product breakdown
 * @module components/dashboard/portfolio-allocation-chart
 */

'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';

interface AllocationItem {
  name: string;
  value: number;
  type: 'YAHOO_FINANCE' | 'CUSTOM';
}

interface PortfolioAllocationChartProps {
  data: AllocationItem[];
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'oklch(0.6 0.15 120)',
  'oklch(0.55 0.12 340)',
  'oklch(0.6 0.1 80)',
];

/**
 * Custom tooltip for allocation chart
 *
 * @param props - Recharts tooltip props
 * @returns Tooltip element
 */
function CustomTooltip({
  active,
  payload,
  format,
}: {
  active?: boolean;
  payload?: Array<{ payload: AllocationItem & { pct: number } }>;
  format: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="glass-card bg-card p-3 rounded-xl shadow-lg">
      <p className="text-xs font-semibold text-foreground mb-1">{item.name}</p>
      <p className="text-sm text-primary font-bold tabular-nums">
        {format(item.value)}
      </p>
      <p className="text-xs text-muted-foreground">{item.pct.toFixed(1)}%</p>
    </div>
  );
}

/**
 * Donut chart showing portfolio allocation by product
 *
 * @param props - Component props with allocation data
 * @returns Donut chart element
 */
export function PortfolioAllocationChart({
  data,
}: PortfolioAllocationChartProps) {
  const { format } = useDisplayCurrency();
  const chartData = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    return data
      .filter((d) => d.value > 0)
      .map((d) => ({ ...d, pct: total > 0 ? (d.value / total) * 100 : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="glass-card rounded-2xl bg-card p-5 shadow-sm">
        <h3 className="font-serif text-lg text-foreground mb-4">Allocation</h3>
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No products yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl bg-card shadow-sm px-4 sm:px-6 pt-5 pb-4">
      <h3 className="font-serif text-lg text-foreground mb-2 px-1">
        Portfolio Allocation
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <ChartContainer
          className="h-[200px] w-[200px] shrink-0"
          config={{ value: { label: 'Value', color: 'var(--chart-1)' } }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                paddingAngle={2}
                strokeWidth={0}
              >
                {chartData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip format={format} />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 w-full min-w-0 max-h-[200px] overflow-y-auto">
          {chartData.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-xs text-foreground truncate flex-1">
                {item.name}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                {item.pct.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
