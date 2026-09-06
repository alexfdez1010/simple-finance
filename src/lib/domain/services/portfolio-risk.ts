/** Cash-flow-adjusted portfolio performance, independent of chart rendering. */
interface Valuation {
  date: string;
  value: number;
}

interface InvestedPoint {
  date: string;
  invested: number;
}

/**
 * Removes signed external flows and compounds returns into a base-100 index.
 * @param valuations - Chronological EUR snapshots, with unique ISO dates.
 * @param invested - Cumulative EUR contributions on every snapshot date.
 * @returns Adjusted EUR changes and a performance index for percentage charts.
 * No side effects. Empty history stays empty; a single snapshot is a baseline.
 * Flows are assumed to occur at period end. Without positive opening capital,
 * the index stays flat because a percentage return cannot be established.
 * @throws When a snapshot has no matching contribution basis.
 */
export function computePortfolioRisk(
  valuations: readonly Valuation[],
  invested: readonly InvestedPoint[],
): {
  performance: Valuation[];
  dailyChanges: Array<{ date: string; change: number }>;
} {
  const basis = new Map(invested.map((point) => [point.date, point.invested]));
  const performance: Valuation[] = [];
  const dailyChanges: Array<{ date: string; change: number }> = [];
  let index = 100;
  for (let i = 0; i < valuations.length; i += 1) {
    const current = valuations[i];
    const currentBasis = basis.get(current.date);
    if (currentBasis === undefined) {
      throw new Error(`Missing contribution basis for ${current.date}`);
    }
    if (i > 0) {
      const previous = valuations[i - 1];
      const flow = currentBasis - basis.get(previous.date)!;
      const change = current.value - previous.value - flow;
      dailyChanges.push({ date: current.date, change });
      if (previous.value > 0) index *= 1 + change / previous.value;
    }
    performance.push({ date: current.date, value: index });
  }
  return { performance, dailyChanges };
}
