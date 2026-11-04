import type { CustomContribution } from '@/lib/domain/models/product.types';

/** Returns effective signed principal at the valuation date; future movements earn nothing. */
export function effectiveCustomPrincipal(
  contributions: CustomContribution[],
  date: Date,
): number {
  return contributions.reduce(
    (sum, movement) => (movement.date <= date ? sum + movement.amount : sum),
    0,
  );
}

/** Returns forward annual yield on current value; simple-interest earnings never enter its basis. */
export function customInterestYield(
  principal: number,
  value: number,
  rate: number,
  reinvest: boolean,
): number {
  return reinvest ? rate : value > 0 ? (principal * rate) / value : 0;
}
