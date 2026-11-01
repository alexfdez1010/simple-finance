import type {
  RunwayHolding,
  RunwayProjection,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';
import { computeRunwayProjection } from './runway-projection';

/** A recoverable calculation result; unavailable forecasts never invent replacement balances. */
export type SafeRunwayProjection =
  | { projection: RunwayProjection; error: null }
  | { projection: null; error: string };

/**
 * Converts unsupported financial inputs into a recoverable display result.
 * @param products - Current portfolio valuations, including any negative balances.
 * @param settings - Validated EUR assumptions and decimal annual rates.
 * @returns The projection or an actionable message for expected numeric limitations.
 * Pure; preserves fail-fast behavior for unexpected programming errors.
 */
export function computeSafeRunwayProjection(
  products: readonly RunwayHolding[],
  settings: RunwaySettings,
): SafeRunwayProjection {
  try {
    return {
      projection: computeRunwayProjection(products, settings),
      error: null,
    };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return {
      projection: null,
      error:
        'This portfolio cannot be projected with the current assumptions. Check for negative balances or try a lower return.',
    };
  }
}
