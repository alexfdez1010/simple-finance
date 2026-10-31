import {
  Bank,
  Buildings,
  ChartLineUp,
  Coins,
  Wallet,
} from '@phosphor-icons/react';
import type { AssetCategory } from '@/lib/domain/models/asset-category';

const categoryPresentation = {
  STOCKS: {
    icon: ChartLineUp,
    tone: 'bg-[#edf4ff] text-[#1d64c8]',
  },
  BONDS_LOANS: {
    icon: Bank,
    tone: 'bg-[#f0f0fc] text-[#6667ad]',
  },
  COMMODITIES: {
    icon: Coins,
    tone: 'bg-[#fbf5e9] text-[#966b1a]',
  },
  REAL_ESTATE: {
    icon: Buildings,
    tone: 'bg-[#eaf6f2] text-[#21776d]',
  },
  CASH: {
    icon: Wallet,
    tone: 'bg-[#eef0f5] text-[#5c667b]',
  },
} satisfies Record<AssetCategory, { icon: typeof Wallet; tone: string }>;

/**
 * Identifies an asset class without relying on a company logo or color alone.
 * @param props - The holding's persisted asset category.
 * @returns A duotone icon with a category-specific palette matching the allocation chart.
 * The adjacent holding text supplies its label; shape also distinguishes each category.
 * Pure presentation without side effects.
 */
export function HoldingIdentity({ category }: { category: AssetCategory }) {
  const { icon: Icon, tone } = categoryPresentation[category];
  return (
    <span
      aria-hidden
      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
    >
      <Icon size={23} weight="duotone" />
    </span>
  );
}
