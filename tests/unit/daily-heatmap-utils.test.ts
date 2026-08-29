import { describe, expect, it } from 'vitest';
import {
  buildHeatmapModel,
  formatHeatmapDate,
  heatmapCellColor,
} from '@/components/dashboard/daily-heatmap-utils';

/** Returns a local ISO date shifted from today by the requested day count. */
function relativeIso(days: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('daily heatmap utilities', () => {
  it('summarizes positive and negative return days', () => {
    const model = buildHeatmapModel([
      { date: relativeIso(-2), value: 100 },
      { date: relativeIso(-1), value: 110 },
      { date: relativeIso(0), value: 99 },
    ]);

    expect(model.up).toBe(1);
    expect(model.down).toBe(1);
    expect(model.best).toBeCloseTo(10);
    expect(model.worst).toBeCloseTo(-10);
    expect(model.grid).toHaveLength(52);
    expect(model.grid.every((week) => week.length === 7)).toBe(true);
  });

  it('ignores percentage calculation when the previous value is zero', () => {
    const model = buildHeatmapModel([
      { date: relativeIso(-1), value: 0 },
      { date: relativeIso(0), value: 50 },
    ]);

    expect(model.up).toBe(0);
    expect(model.down).toBe(0);
    expect(model.maxAbs).toBe(0);
  });

  it('uses neutral and semantic colors for cells', () => {
    expect(heatmapCellColor(null, 5)).toBe('var(--surface-secondary)');
    expect(heatmapCellColor(2, 5)).toContain('155');
    expect(heatmapCellColor(-2, 5)).toContain('25');
  });

  it('formats ISO dates without shifting the day', () => {
    expect(formatHeatmapDate('2026-08-29')).toMatch(/Aug 29/);
  });
});
