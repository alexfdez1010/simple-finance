/** A completed month's portfolio gain, with all values expressed in EUR. */
export interface MonthlyInvestmentGain {
  month: string;
  openingValue: number;
  closingValue: number;
  netContributions: number;
  gain: number;
}

/**
 * Computes gains independently of deposits and signed withdrawals.
 * @param snapshots - ISO daily EUR valuations; order is irrelevant.
 * @param invested - Cumulative EUR contributions at each snapshot date.
 * @param today - Current UTC ISO date, supplied by the server for determinism.
 * @returns Completed months with both calendar closing snapshots and cost bases.
 * No side effects. Missing/non-finite boundaries and incomplete months are omitted;
 * an initial portfolio balance is never assumed to be zero.
 */
export function computeMonthlyInvestmentGains(
  snapshots: readonly { date: string; value: number }[],
  invested: readonly { date: string; invested: number }[],
  today: string,
): MonthlyInvestmentGain[] {
  const values = new Map(snapshots.map((point) => [point.date, point.value]));
  const bases = new Map(invested.map((point) => [point.date, point.invested]));
  const months = [
    ...new Set(snapshots.map((point) => point.date.slice(0, 7))),
  ].sort();
  const result: MonthlyInvestmentGain[] = [];
  for (const month of months) {
    if (month >= today.slice(0, 7)) continue;
    const [year, number] = month.split('-').map(Number);
    const openingDate = new Date(Date.UTC(year, number - 1, 0))
      .toISOString()
      .slice(0, 10);
    const closingDate = new Date(Date.UTC(year, number, 0))
      .toISOString()
      .slice(0, 10);
    const openingValue = values.get(openingDate);
    const closingValue = values.get(closingDate);
    const openingBasis = bases.get(openingDate);
    const closingBasis = bases.get(closingDate);
    if (
      openingValue === undefined ||
      closingValue === undefined ||
      openingBasis === undefined ||
      closingBasis === undefined ||
      ![openingValue, closingValue, openingBasis, closingBasis].every(
        Number.isFinite,
      )
    )
      continue;
    const netContributions = closingBasis - openingBasis;
    result.push({
      month,
      openingValue,
      closingValue,
      netContributions,
      gain: closingValue - openingValue - netContributions,
    });
  }
  return result;
}
