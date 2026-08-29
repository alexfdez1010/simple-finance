'use client';

import * as React from 'react';
import * as Recharts from 'recharts';
import {
  ChartContext,
  ChartStyle,
  type ChartConfig,
} from '@/components/ui/chart-context';
import { cn } from '@/lib/utils';

interface ChartContainerProps extends React.ComponentProps<'div'> {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof Recharts.ResponsiveContainer
  >['children'];
}

/**
 * Provides scoped colors, responsive sizing, and an accessible chart region.
 *
 * @param props - Container attributes, chart configuration, and Recharts child.
 * @returns A responsive Recharts container with shared financial styling.
 */
function ChartContainer({
  id,
  className,
  children,
  config,
  'aria-label': ariaLabel = 'Financial chart',
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        aria-label={ariaLabel}
        className={cn(
          '[&_.recharts-cartesian-axis-tick_text]:fill-muted [&_.recharts-cartesian-grid_line]:stroke-border/70 [&_.recharts-layer]:outline-none [&_.recharts-sector]:outline-none flex aspect-video justify-center text-xs',
          className,
        )}
        data-chart={chartId}
        data-slot="chart"
        role="img"
        {...props}
      >
        <ChartStyle config={config} id={chartId} />
        <Recharts.ResponsiveContainer>{children}</Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export { ChartContainer, ChartStyle };
export type { ChartConfig };
export {
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart-tooltip';
export { ChartLegend, ChartLegendContent } from '@/components/ui/chart-legend';
