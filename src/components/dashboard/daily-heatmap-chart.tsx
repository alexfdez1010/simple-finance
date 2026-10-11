/** Daily return heatmap for the latest 52 weeks. */
'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  buildHeatmapModel,
  formatHeatmapDate,
  heatmapCellColor,
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
 * @returns A chart card with an accessible summary and focusable history.
 * @remarks Starts at the latest week when data changes; empty series have no scroller.
 */
export function DailyHeatmapChart({ data }: DailyHeatmapChartProps) {
  const model = useMemo(() => buildHeatmapModel(data), [data]);
  const sample = model.up + model.down;
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = historyRef.current;
    if (history) history.scrollLeft = history.scrollWidth - history.clientWidth;
  }, [model]);

  if (sample === 0) {
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
          <div
            ref={historyRef}
            role="region"
            aria-label="Daily return history"
            tabIndex={0}
            className="flex min-w-0 flex-1 gap-[3px] overflow-x-auto pb-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {model.grid.map((column, columnIndex) => (
              <div className="flex flex-col gap-[3px]" key={columnIndex}>
                {column.map((cell) => {
                  const label =
                    cell.pct === null
                      ? `${formatHeatmapDate(cell.date)} · no data`
                      : `${formatHeatmapDate(cell.date)} · ${cell.pct >= 0 ? '+' : ''}${cell.pct.toFixed(2)}%`;
                  return (
                    <span
                      aria-hidden="true"
                      className="size-3.5 rounded-sm"
                      key={cell.date}
                      style={{
                        backgroundColor: heatmapCellColor(
                          cell.pct,
                          model.maxAbs,
                        ),
                      }}
                      title={label}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Latest weeks shown. Scroll or use arrow keys to explore earlier weeks.
        </p>
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
