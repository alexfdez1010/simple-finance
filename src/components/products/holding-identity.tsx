import {
  Bank,
  Buildings,
  ChartLineUp,
  Coins,
  Wallet,
} from '@phosphor-icons/react';
import type { AssetCategory } from '@/lib/domain/models/asset-category';

const categoryIcons = {
  STOCKS: ChartLineUp,
  BONDS_LOANS: Bank,
  COMMODITIES: Coins,
  REAL_ESTATE: Buildings,
  CASH: Wallet,
} satisfies Record<AssetCategory, typeof Wallet>;

/**
 * Identifies an asset class without relying on a company logo or color alone.
 * @param props - The holding's persisted asset category.
 * @returns A decorative category icon; the adjacent holding text supplies its label.
 * Pure presentation without side effects.
 */
export function HoldingIdentity({ category }: { category: AssetCategory }) {
  const Icon = categoryIcons[category];
  return (
    <span
      aria-hidden
      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary"
    >
      <Icon size={23} weight="duotone" />
    </span>
  );
}
