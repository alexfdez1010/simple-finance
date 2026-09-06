/** Daily return heatmap for the latest 52 weeks. */
'use client';

import { useMemo } from 'react';
import { DailyHeatmapDay } from './daily-heatmap-day';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  buildHeatmapModel,
  HEATMAP_WEEKS,
  WEEKDAYS,
} from '@/components/dashboard/daily-heatmap-utils';

interface DailyHeatmapChartProps {
  data: Array<{ date: string; value: number }>;
}

/**
 * Renders daily return direction and magnitude as a compact calendar grid.
 *
 * @param props - Daily portfolio value series.
 * @returns A HeroUI chart card with an accessible text summary.
 */
export function DailyHeatmapChart({ data }: DailyHeatmapChartProps) {
  const model = useMemo(() => buildHeatmapModel(data), [data]);

  if (!model.grid.some((week) => week.some((cell) => cell.pct !== null))) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Daily Heatmap</CardTitle>
          <CardDescription>
            No daily snapshots yet. Heatmap fills in as history accrues.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const summary = `${model.up} gain days and ${model.down} loss days. Best ${model.best.toFixed(2)} percent, worst ${model.worst.toFixed(2)} percent.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Daily Heatmap</CardTitle>
        <CardDescription>Last {HEATMAP_WEEKS} weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="font-serif text-2xl tabular-nums">
            <span className="text-gain">{model.up}</span>
            <span className="text-muted"> / </span>
            <span className="text-loss">{model.down}</span>
          </p>
          <span className="text-xs text-muted tabular-nums">
            best <span className="text-gain">+{model.best.toFixed(2)}%</span> ·
            worst <span className="text-loss"> {model.worst.toFixed(2)}%</span>
          </span>
        </div>
        <div aria-label={summary} className="flex gap-2" role="group">
          <div className="flex flex-col gap-[3px] pr-1 text-[10px] text-muted">
            {WEEKDAYS.map((day, index) => (
              <span
                className="h-3.5 leading-3.5"
                key={day}
                style={{ visibility: index % 2 === 0 ? 'visible' : 'hidden' }}
              >
                {day}
              </span>
            ))}
          </div>
          <div className="flex flex-1 gap-[3px] overflow-x-auto pb-1">
            {model.grid.map((column, columnIndex) => (
              <div className="flex flex-col gap-[3px]" key={columnIndex}>
                {column.map((cell) => (
                  <DailyHeatmapDay
                    key={cell.date}
                    cell={cell}
                    maxAbs={model.maxAbs}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <HeatmapLegend />
      </CardContent>
    </Card>
  );
}

/** Renders the loss-to-gain intensity key for the heatmap. */
function HeatmapLegend() {
  return (
    <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted">
      <span>Loss</span>
      {[0.8, 0.45].map((opacity) => (
        <span
          className="size-2.5 rounded-sm"
          key={`loss-${opacity}`}
          style={{ backgroundColor: `oklch(0.55 0.15 25 / ${opacity})` }}
        />
      ))}
      <span className="size-2.5 rounded-sm bg-surface-secondary" />
      {[0.45, 0.8].map((opacity) => (
        <span
          className="size-2.5 rounded-sm"
          key={`gain-${opacity}`}
          style={{ backgroundColor: `oklch(0.55 0.15 155 / ${opacity})` }}
        />
      ))}
      <span>Gain</span>
    </div>
  );
}
