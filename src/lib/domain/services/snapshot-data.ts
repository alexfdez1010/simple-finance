/** Serializable portfolio histories shared by independently loaded routes. */
export interface PortfolioSnapshotPoint {
  date: Date;
  value: number;
}

/**
 * Groups snapshots by UTC month and derives adjacent valuation changes.
 * @param snapshots - Chronologically ordered valuations; never mutated.
 * @returns Serializable full history, month-end values, and daily changes.
 * Empty histories produce empty series; changes include external cash flows.
 */
export function buildSnapshotData(
  snapshots: readonly PortfolioSnapshotPoint[],
) {
  const allEvolutionData = snapshots.map(({ date, value }) => ({
    date: date.toISOString().slice(0, 10),
    value,
  }));
  const months = new Map<string, number>();
  for (const point of allEvolutionData)
    months.set(point.date.slice(0, 7), point.value);
  return {
    allEvolutionData,
    evolutionData: allEvolutionData.slice(-90),
    monthlyWealthData: Array.from(months, ([month, value]) => ({
      month,
      value,
    })),
    dailyChanges: allEvolutionData.slice(1).map((point, index) => ({
      date: point.date,
      change: point.value - allEvolutionData[index].value,
    })),
  };
}
