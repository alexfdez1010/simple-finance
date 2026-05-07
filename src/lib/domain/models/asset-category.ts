/**
 * Asset category enum + UI helpers. Mirrors the `AssetCategory` Prisma enum.
 * @module domain/models/asset-category
 */

export type AssetCategory =
  | 'STOCKS'
  | 'BONDS_LOANS'
  | 'COMMODITIES'
  | 'REAL_ESTATE'
  | 'CASH';

export const ASSET_CATEGORIES: readonly AssetCategory[] = [
  'STOCKS',
  'BONDS_LOANS',
  'COMMODITIES',
  'REAL_ESTATE',
  'CASH',
] as const;

export const DEFAULT_ASSET_CATEGORY: AssetCategory = 'STOCKS';

const LABELS: Record<AssetCategory, string> = {
  STOCKS: 'Stocks',
  BONDS_LOANS: 'Bonds & Loans',
  COMMODITIES: 'Commodities',
  REAL_ESTATE: 'Real Estate',
  CASH: 'Cash',
};

/** Returns the human-readable label for a category. */
export function assetCategoryLabel(category: AssetCategory): string {
  return LABELS[category];
}
