'use client';

import * as Recharts from 'recharts';
import {
  getPayloadConfigFromPayload,
  useChart,
} from '@/components/ui/chart-context';
import { cn } from '@/lib/utils';

export const ChartLegend = Recharts.Legend;

interface ChartLegendContentProps
  extends
    React.ComponentProps<'div'>,
    Pick<Recharts.LegendProps, 'payload' | 'verticalAlign'> {
  hideIcon?: boolean;
  nameKey?: string;
}

/** Renders a compact legend tied to the current chart configuration. */
export function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-4 text-xs text-muted',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload
        .filter((item) => item.type !== 'none')
        .map((item) => {
          const key = `${nameKey || item.dataKey || 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          return (
            <span className="flex items-center gap-1.5" key={item.value}>
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <span
                  className="size-2 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
              )}
              {itemConfig?.label}
            </span>
          );
        })}
    </div>
  );
}
