'use client';

import * as React from 'react';
import * as Recharts from 'recharts';
import {
  getPayloadConfigFromPayload,
  useChart,
} from '@/components/ui/chart-context';
import { cn } from '@/lib/utils';

export const ChartTooltip = Recharts.Tooltip;

type ChartTooltipContentProps = React.ComponentProps<typeof Recharts.Tooltip> &
  Omit<React.ComponentProps<'div'>, 'content'> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
  };

/** Renders the shared, tabular Recharts tooltip surface. */
export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart();
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null;
    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === 'string'
        ? config[label]?.label || label
        : itemConfig?.label;
    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }
    return value ? (
      <div className={cn('font-medium', labelClassName)}>{value}</div>
    ) : null;
  }, [
    config,
    hideLabel,
    label,
    labelClassName,
    labelFormatter,
    labelKey,
    payload,
  ]);

  if (!active || !payload?.length) return null;
  const nestLabel = payload.length === 1 && indicator !== 'dot';

  return (
    <div
      className={cn(
        'grid min-w-32 items-start gap-1.5 rounded-md border border-border bg-overlay px-2.5 py-2 text-xs shadow-sm',
        className,
      )}
    >
      {!nestLabel && tooltipLabel}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== 'none')
          .map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || 'value'}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload.fill || item.color;
            return (
              <div
                className="flex w-full items-center gap-2"
                key={`${item.dataKey}-${index}`}
              >
                {formatter && item.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {!hideIndicator && (
                      <span
                        className={cn(
                          'size-2 shrink-0 rounded-sm',
                          indicator === 'line' && 'h-3 w-1',
                          indicator === 'dashed' &&
                            'h-3 w-1 border border-dashed bg-transparent',
                        )}
                        style={{ backgroundColor: indicatorColor }}
                      />
                    )}
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                      <span className="text-muted">
                        {nestLabel
                          ? tooltipLabel
                          : itemConfig?.label || item.name}
                      </span>
                      {item.value != null && (
                        <span className="font-mono font-medium tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
