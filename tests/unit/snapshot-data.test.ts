import { describe, expect, it } from 'vitest';
import { buildSnapshotData } from '@/lib/domain/services/snapshot-data';

describe('buildSnapshotData', () => {
  it('preserves absent histories without invented changes', () => {
    expect(buildSnapshotData([])).toEqual({
      allEvolutionData: [],
      evolutionData: [],
      monthlyWealthData: [],
      dailyChanges: [],
    });
  });
  it('groups months in UTC and keeps signed adjacent changes', () => {
    const snapshots = [
      { date: new Date('2026-08-31T23:30:00Z'), value: 100 },
      { date: new Date('2026-09-01T00:00:00Z'), value: 140 },
      { date: new Date('2026-09-30T00:00:00Z'), value: 120 },
    ];
    const original = structuredClone(snapshots);
    const result = buildSnapshotData(snapshots);
    expect(result.monthlyWealthData).toEqual([
      { month: '2026-08', value: 100 },
      { month: '2026-09', value: 120 },
    ]);
    expect(result.dailyChanges).toEqual([
      { date: '2026-09-01', change: 40 },
      { date: '2026-09-30', change: -20 },
    ]);
    expect(snapshots).toEqual(original);
  });
  it('bounds the overview while preserving the full history for monthly analytics', () => {
    const snapshots = Array.from({ length: 120 }, (_, index) => ({
      date: new Date(Date.UTC(2026, 0, index + 1)),
      value: index,
    }));
    const result = buildSnapshotData(snapshots);
    expect(result.allEvolutionData).toHaveLength(120);
    expect(result.evolutionData).toHaveLength(90);
    expect(result.evolutionData[0].value).toBe(30);
  });
});
