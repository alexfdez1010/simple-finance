import 'server-only';
import { cache } from 'react';
import { findAllProducts } from '@/lib/infrastructure/database/product-repository';
import { enrichProductsWithEurValues } from '@/lib/domain/services/product-enrichment';
import { getPortfolioSnapshotsLastNDays } from '@/lib/infrastructure/database/portfolio-snapshot-repository';
import { getDisplayRates } from '@/lib/domain/services/display-rates';
import { buildSnapshotData } from '@/lib/domain/services/snapshot-data';

/**
 * Loads sorted, valued holdings once per server render.
 * @returns A new descending-value collection; database errors reach the route boundary.
 * Side effects are database/market reads and existing legacy EUR-basis backfills.
 */
export const loadPortfolioProducts = cache(async () => {
  const products = await enrichProductsWithEurValues(await findAllProducts());
  return products.sort((a, b) => b.currentValueEur - a.currentValueEur);
});

/**
 * Loads a bounded portfolio history once per render and lookback.
 * @param days - Lookback in calendar days, defaulting to one year.
 * @returns Serializable series; absent snapshots yield empty histories.
 * Reads the snapshot repository and propagates failures to the route boundary.
 */
export const loadPortfolioHistory = cache(async (days = 365) =>
  buildSnapshotData(await getPortfolioSnapshotsLastNDays(days)),
);

/** Reads display conversion rates once per render; failed quotes propagate. */
export const loadDisplayRates = cache(getDisplayRates);
