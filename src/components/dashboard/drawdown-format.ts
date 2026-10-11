/**
 * Formats a percentage axis tick without obscuring fractional declines.
 * @param value - Percentage point value supplied by the chart axis.
 * @returns A percentage label with up to two decimals and normalized zero.
 * @remarks Pure; values rounding to zero never display a negative sign.
 */
export function formatDrawdownTick(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return `${(rounded === 0 ? 0 : rounded).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })}%`;
}
