export const HEATMAP_WEEKS = 52;
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface HeatmapCell {
  date: string;
  pct: number | null;
}

export interface HeatmapModel {
  grid: HeatmapCell[][];
  maxAbs: number;
  up: number;
  down: number;
  best: number;
  worst: number;
}

/** Formats an ISO date for compact chart metadata. */
export function formatHeatmapDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Returns an OKLCH status color whose opacity represents return magnitude. */
export function heatmapCellColor(pct: number | null, maxAbs: number): string {
  if (pct === null || maxAbs === 0) return 'var(--surface-secondary)';
  const intensity = Math.min(Math.abs(pct) / maxAbs, 1);
  const opacity = (0.2 + intensity * 0.8).toFixed(2);
  const hue = pct >= 0 ? 155 : 25;
  return `oklch(0.55 0.15 ${hue} / ${opacity})`;
}

/** Builds the 52-week return grid and its accessible summary statistics. */
export function buildHeatmapModel(
  series: Array<{ date: string; value: number }>,
): HeatmapModel {
  const percentages = buildPercentageMap(series);
  const grid = buildGrid(percentages);
  let maxAbs = 0;
  let up = 0;
  let down = 0;
  let best = 0;
  let worst = 0;

  for (const column of grid) {
    for (const cell of column) {
      if (cell.pct === null) continue;
      maxAbs = Math.max(maxAbs, Math.abs(cell.pct));
      best = Math.max(best, cell.pct);
      worst = Math.min(worst, cell.pct);
      if (cell.pct > 0) up += 1;
      if (cell.pct < 0) down += 1;
    }
  }
  return { grid, maxAbs, up, down, best, worst };
}

/** Derives daily percentage returns keyed by ISO date. */
function buildPercentageMap(
  series: Array<{ date: string; value: number }>,
): Map<string, number> {
  const values = new Map<string, number>();
  for (let index = 1; index < series.length; index += 1) {
    const previous = series[index - 1].value;
    if (previous > 0) {
      values.set(
        series[index].date.slice(0, 10),
        ((series[index].value - previous) / previous) * 100,
      );
    }
  }
  return values;
}

/** Produces Monday-to-Sunday columns ordered from oldest to newest. */
function buildGrid(percentages: Map<string, number>): HeatmapCell[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + (6 - ((today.getDay() + 6) % 7)));

  return Array.from({ length: HEATMAP_WEEKS }, (_, columnIndex) => {
    const weeksAgo = HEATMAP_WEEKS - 1 - columnIndex;
    return Array.from({ length: 7 }, (_, rowIndex) => {
      const date = new Date(weekEnd);
      date.setDate(weekEnd.getDate() - weeksAgo * 7 - (6 - rowIndex));
      const key = toIsoDate(date);
      return { date: key, pct: percentages.get(key) ?? null };
    });
  });
}

/** Converts a local date to YYYY-MM-DD without applying a timezone offset. */
function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
