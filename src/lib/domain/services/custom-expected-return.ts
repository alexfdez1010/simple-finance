/**
 * Combines a custom product's contractual yield with the geometric-mean
 * appreciation of its currency against EUR to produce a forward-looking
 * EUR-denominated expected return.
 *
 * Formula (compounding the two rates):
 *   combined = (1 + yield) · (1 + fxGeomean) − 1
 *
 * When the FX history is unavailable the yield itself is returned — a
 * principal-only estimate is still useful and avoids surfacing `null`
 * everywhere a foreign-currency custom product appears.
 *
 * @module domain/services/custom-expected-return
 */

/**
 * Compounds the contractual annual yield with the FX geometric mean.
 *
 * @param yieldRate - Custom product annual return rate as decimal (0.05 = 5%)
 * @param fxGeomeanVsEur - 5-year geomean FX appreciation vs EUR (0 = EUR)
 * @returns EUR-denominated expected annual return as decimal
 */
export function combineExpectedReturn(
  yieldRate: number,
  fxGeomeanVsEur: number | null,
): number {
  if (fxGeomeanVsEur == null) return yieldRate;
  return (1 + yieldRate) * (1 + fxGeomeanVsEur) - 1;
}
