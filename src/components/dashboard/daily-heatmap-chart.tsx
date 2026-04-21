/**
 * Daily heatmap: GitHub-contribution-style grid of daily % returns across the
 * last 26 weeks × 7 weekdays. Cell hue encodes sign, opacity encodes
 * magnitude. Reveals clusters, streaks, and weekday patterns at a glance —
 * a visual shape no time-series bar chart surfaces.
 * @module components/dashboard/daily-heatmap-chart
 */

'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

/** Format ISO date as "Mon, Apr 14" for the hover tooltip. */
function formatTooltipDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

interface DailyHeatmapChartProps {
  data: Array<{ date: string; value: number }>;
}

const WEEKS = 26;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Cell {
  date: string;
  pct: number | null;
}

/** YYYY-MM-DD for a local Date. */
function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Map of ISO-date → daily pct return, derived from a value series. */
function buildPctMap(
  series: Array<{ date: string; value: number }>,
): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].value;
    if (prev > 0) {
      const key = series[i].date.slice(0, 10);
      map.set(key, ((series[i].value - prev) / prev) * 100);
    }
  }
  return map;
}

/**
 * Build week-columns (oldest → newest) of 7 weekday-rows (Mon..Sun).
 * Cells with no data are rendered blank.
 */
function buildGrid(pctMap: Map<string, number>): Cell[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekdayIdx = (today.getDay() + 6) % 7;
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + (6 - weekdayIdx));
  const cols: Cell[][] = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const col: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(weekEnd);
      cell.setDate(weekEnd.getDate() - w * 7 - (6 - d));
      const iso = isoDate(cell);
      col.push({ date: iso, pct: pctMap.get(iso) ?? null });
    }
    cols.push(col);
  }
  return cols;
}

/** oklch color for a cell: hue from sign, opacity from |pct|/maxAbs. */
function cellColor(pct: number | null, maxAbs: number): string {
  if (pct === null || maxAbs === 0)
    return 'color-mix(in oklch, var(--muted) 60%, transparent)';
  const intensity = Math.min(Math.abs(pct) / maxAbs, 1);
  const opacity = (0.18 + intensity * 0.82).toFixed(2);
  const hue = pct >= 0 ? 155 : 25;
  return `oklch(0.55 0.17 ${hue} / ${opacity})`;
}

/**
 * Heatmap grid of daily returns over the last 26 weeks.
 *
 * @param props - Component props with daily portfolio evolution data
 * @returns Chart element
 */
export function DailyHeatmapChart({ data }: DailyHeatmapChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const { grid, maxAbs, up, down, best, worst } = useMemo(() => {
    const map = buildPctMap(data);
    const g = buildGrid(map);
    let max = 0;
    let u = 0;
    let dn = 0;
    let bestVal = 0;
    let worstVal = 0;
    for (const col of g) {
      for (const cell of col) {
        if (cell.pct === null) continue;
        const abs = Math.abs(cell.pct);
        if (abs > max) max = abs;
        if (cell.pct > bestVal) bestVal = cell.pct;
        if (cell.pct < worstVal) worstVal = cell.pct;
        if (cell.pct > 0) u++;
        else if (cell.pct < 0) dn++;
      }
    }
    return {
      grid: g,
      maxAbs: max,
      up: u,
      down: dn,
      best: bestVal,
      worst: worstVal,
    };
  }, [data]);

  const sample = up + down;

  if (sample === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Daily Heatmap</CardTitle>
          <CardDescription>
            No daily snapshots yet. Heatmap fills in as history accrues.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg">Daily Heatmap</CardTitle>
        <CardDescription>Last {WEEKS} weeks · sign × magnitude</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-xl sm:text-2xl font-bold tabular-nums">
            <span className="text-gain">{up}</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-loss">{down}</span>
          </p>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            best <span className="text-gain">+{best.toFixed(2)}%</span> · worst{' '}
            <span className="text-loss">{worst.toFixed(2)}%</span>
          </span>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col gap-[3px] pt-0.5 pr-1 text-[10px] text-muted-foreground">
            {WEEKDAYS.map((d, i) => (
              <span
                key={d}
                className="h-3.5 leading-3.5"
                style={{ visibility: i % 2 === 0 ? 'visible' : 'hidden' }}
              >
                {d}
              </span>
            ))}
          </div>
          <div
            className="flex flex-1 gap-[3px] overflow-x-auto"
            onMouseLeave={() => setTooltip(null)}
          >
            {grid.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[3px]">
                {col.map((cell, ri) => {
                  const label =
                    cell.pct !== null
                      ? `${formatTooltipDate(cell.date)} · ${cell.pct >= 0 ? '+' : ''}${cell.pct.toFixed(2)}%`
                      : `${formatTooltipDate(cell.date)} · no data`;
                  const onMove = (e: React.MouseEvent) =>
                    setTooltip({ text: label, x: e.clientX, y: e.clientY });
                  return (
                    <div
                      key={ri}
                      aria-label={label}
                      onMouseEnter={onMove}
                      onMouseMove={onMove}
                      className="h-3.5 w-3.5 rounded-sm transition-transform hover:scale-125"
                      style={{ background: cellColor(cell.pct, maxAbs) }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {tooltip && (
          <div
            role="tooltip"
            className="pointer-events-none fixed z-50 rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium tabular-nums text-popover-foreground shadow-md"
            style={{ left: tooltip.x + 12, top: tooltip.y - 30 }}
          >
            {tooltip.text}
          </div>
        )}
        <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
          <span>Loss</span>
          {[0.85, 0.55, 0.3].map((o) => (
            <div
              key={`l-${o}`}
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: `oklch(0.55 0.17 25 / ${o})` }}
            />
          ))}
          <div className="h-2.5 w-2.5 rounded-sm bg-muted/60" />
          {[0.3, 0.55, 0.85].map((o) => (
            <div
              key={`g-${o}`}
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: `oklch(0.55 0.17 155 / ${o})` }}
            />
          ))}
          <span>Gain</span>
        </div>
      </CardContent>
    </Card>
  );
}
