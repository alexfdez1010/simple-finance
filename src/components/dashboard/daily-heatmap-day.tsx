/** Clickable calendar cell with an accessible daily-return popover. */
'use client';

import { Button, Popover } from '@heroui/react';
import {
  formatHeatmapDate,
  heatmapCellColor,
  type HeatmapCell,
} from './daily-heatmap-utils';

/**
 * Shows a day's adjusted return on click, touch, or keyboard activation.
 * @param props - Calendar cell and maximum absolute return for its color scale.
 * @returns A popover trigger, or a noninteractive placeholder for missing data.
 * Opening the popover moves focus into it; Escape/outside press dismisses it.
 */
export function DailyHeatmapDay({
  cell,
  maxAbs,
}: {
  cell: HeatmapCell;
  maxAbs: number;
}) {
  const date = `${formatHeatmapDate(cell.date)}, ${cell.date.slice(0, 4)}`;
  const style = { backgroundColor: heatmapCellColor(cell.pct, maxAbs) };
  if (cell.pct === null) {
    return (
      <span
        className="size-3.5 rounded-sm"
        style={style}
        title={`${date} · no data`}
      />
    );
  }
  const returnText = `${cell.pct >= 0 ? '+' : ''}${cell.pct.toFixed(2)}%`;
  return (
    <Popover>
      <Button
        aria-label={`${date}: ${returnText} return`}
        className="size-3.5 min-h-0 min-w-0 rounded-sm p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        style={style}
      />
      <Popover.Content placement="top">
        <Popover.Arrow />
        <Popover.Dialog className="p-3">
          <Popover.Heading className="text-sm">{date}</Popover.Heading>
          <p
            className={`mt-1 text-2xl font-semibold tabular-nums ${cell.pct < 0 ? 'text-loss' : 'text-gain'}`}
          >
            {returnText}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Return excluding contributions
          </p>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
