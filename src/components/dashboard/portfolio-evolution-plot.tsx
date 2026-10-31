'use client';

import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useDisplayCurrency } from './display-currency-context';

const chartConfig = {
  value: { label: 'Portfolio Value', color: 'var(--chart-1)' },
} satisfies ChartConfig;

/**
 * Plots a bounded set of portfolio valuations with a unique area-fill definition.
 * @param props - Chronological EUR observations, already restricted to the selected range.
 * @returns A responsive chart; a single observation remains visible as a dot.
 * No fetching or mark animation; the independent CSS reveal respects reduced motion.
 */
export function PortfolioEvolutionPlot({
  data,
}: {
  data: Array<{ date: string; value: number }>;
}) {
  const { format } = useDisplayCurrency();
  const gradientId = useId().replace(/:/g, '');
  const values = data.map((point) => point.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const padding = (maximum - minimum) * 0.1 || Math.abs(maximum) * 0.05 || 1;

  return (
    <ChartContainer
      config={chartConfig}
      className="chart-reveal h-[260px] w-full sm:h-[280px]"
      aria-label="Portfolio value across snapshots"
    >
      <AreaChart data={data} margin={{ left: 4, right: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-value)"
              stopOpacity={0.2}
            />
            <stop
              offset="100%"
              stopColor="var(--color-value)"
              stopOpacity={0.01}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 5"
          strokeOpacity={0.7}
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={32}
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
          }
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={82}
          tickCount={5}
          tickFormatter={(value) => format(value, { compact: true })}
          domain={[
            Math.min(0, minimum) < 0
              ? minimum - padding
              : Math.max(0, minimum - padding),
            maximum + padding,
          ]}
        />
        <ChartTooltip
          cursor={{ stroke: 'var(--chart-1)', strokeDasharray: '4 4' }}
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                new Date(value as string).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              }
              formatter={(value) => [format(Number(value)), 'Value']}
            />
          }
        />
        <Area
          isAnimationActive={false}
          dataKey="value"
          type="monotone"
          fill={`url(#${gradientId})`}
          stroke="var(--color-value)"
          strokeWidth={2.5}
          dot={data.length === 1}
          activeDot={{ r: 5, stroke: '#fff', strokeWidth: 3 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
