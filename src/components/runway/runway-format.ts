/** Formats a finite runway in months/years; a missing exhaustion is bounded to the model horizon. */
export function formatRunwayMonths(months: number | null): string {
  if (months == null) return '50+ years';
  if (months < 1) return `${Number(months.toFixed(1))} months`;
  if (months < 12) return `${Number(months.toFixed(1))} months`;
  const years = Math.floor(months / 12);
  const rest = Math.floor(months % 12);
  return `${years} ${years === 1 ? 'year' : 'years'}${rest ? ` ${rest} mo` : ''}`;
}
