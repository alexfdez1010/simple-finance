/**
 * Product card. All amounts render in the user-selected display currency
 * (the dashboard global selector); per-product currency only matters when
 * adding or removing movements inside the edit dialog.
 *
 * @module components/products/product-card
 */

'use client';

import { Button, Card, Chip } from '@heroui/react';
import { Eye, PencilSimple, TrashSimple } from '@phosphor-icons/react';
import { ProductDetails } from '@/components/products/product-details';
import { useProductDateLabel } from '@/components/products/use-product-date-label';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import type { FinancialProduct } from '@/lib/domain/models/product.types';
import { assetCategoryLabel } from '@/lib/domain/models/asset-category';

interface ProductCardProps {
  product: FinancialProduct;
  currentValue?: number;
  /** Total current value in EUR (already includes quantity). */
  currentValueEur?: number;
  /** Total net invested in EUR (signed, already includes quantity). */
  investedEur?: number;
  /** Forward-looking annual return as a decimal (Yahoo: 5y geometric mean). */
  expectedAnnualReturn?: number | null;
  onEdit?: (product: FinancialProduct) => void;
  onDelete?: (product: FinancialProduct) => void;
  onView?: (product: FinancialProduct) => void;
}

/** Formats percentage value with sign */
function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/**
 * Product card with enhanced visual design and dialog-based actions.
 *
 * @param props - Component props
 * @returns Product card element
 */
export function ProductCard({
  product,
  currentValue = 0,
  currentValueEur,
  investedEur,
  expectedAnnualReturn,
  onEdit,
  onDelete,
  onView,
}: ProductCardProps) {
  const { format: formatCurrency } = useDisplayCurrency();
  const isYahoo = product.type === 'YAHOO_FINANCE';
  const totalValue = currentValueEur ?? currentValue * product.quantity;
  const dateString = useProductDateLabel(product);

  const fallbackInvested = isYahoo
    ? product.yahoo.purchasePrice * product.quantity
    : 0;
  const invested = investedEur ?? fallbackInvested;
  const returnValue = totalValue - invested;
  const returnPct = invested > 0 ? (returnValue / invested) * 100 : 0;
  const isPositive = returnValue >= 0;

  return (
    <Card
      className="finance-card h-full py-0 transition-transform duration-200 hover:-translate-y-0.5"
      data-testid="product-card"
    >
      <Card.Header className="flex-row items-start justify-between p-5 pb-3">
        <div className="min-w-0 flex-1 mr-2">
          <h3 className="text-base font-semibold text-foreground truncate">
            {product.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <Chip
              size="sm"
              variant="secondary"
              className="font-mono text-[10px]"
            >
              {isYahoo ? product.yahoo.symbol : product.custom.currency}
            </Chip>
            <Chip size="sm" variant="tertiary" className="text-[10px]">
              {assetCategoryLabel(product.assetCategory)}
            </Chip>
            <span className="text-[10px] text-muted-foreground">
              {dateString}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={() => onView(product)}
              aria-label="View product history"
            >
              <Eye aria-hidden size={16} />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={() => onEdit(product)}
              aria-label="Edit product"
            >
              <PencilSimple aria-hidden size={16} />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              onPress={() => onDelete(product)}
              aria-label="Delete product"
              className="text-loss"
            >
              <TrashSimple aria-hidden size={16} />
            </Button>
          )}
        </div>
      </Card.Header>

      <Card.Content className="flex flex-1 flex-col px-5 pb-5">
        <div className="mb-6">
          <p className="font-serif text-3xl font-semibold text-foreground tabular-nums">
            {formatCurrency(totalValue)}
          </p>
          <p
            className={`text-sm font-semibold tabular-nums mt-0.5 ${isPositive ? 'text-gain' : 'text-loss'}`}
          >
            {formatCurrency(returnValue)} ({formatPercentage(returnPct)})
          </p>
        </div>

        <ProductDetails
          product={product}
          currentValue={currentValue}
          expectedAnnualReturn={expectedAnnualReturn}
          formatCurrency={formatCurrency}
        />
      </Card.Content>
    </Card>
  );
}
