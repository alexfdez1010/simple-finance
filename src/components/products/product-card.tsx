/**
 * Product card. All amounts render in the user-selected display currency
 * (the dashboard global selector); per-product currency only matters when
 * adding or removing movements inside the edit dialog.
 *
 * @module components/products/product-card
 */

'use client';

import { useId } from 'react';
import { Button, Card, Chip } from '@heroui/react';
import { Eye, PencilSimple, TrashSimple } from '@phosphor-icons/react';
import { ProductDetails } from '@/components/products/product-details';
import { HoldingIdentity } from '@/components/products/holding-identity';
import { useProductDateLabel } from '@/components/products/use-product-date-label';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import { ProfitRateDisplay } from '@/components/dashboard/profit-rate-display';
import { calculateProductProfitRates } from '@/lib/domain/services/profit-rate-calculator';
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

/**
 * Formats a return percentage without changing its financial value.
 * @param value - Percentage points; zero retains an explicit positive sign.
 * @returns A signed, two-decimal percentage string without side effects.
 */
function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/**
 * Presents one holding with a comparable value, return, details, and focused actions.
 * @param props - Holding, prepared EUR valuation, return assumption, and action callbacks.
 * @returns A currency-aware card; missing estimates stay unavailable.
 * Actions delegate mutations to the workspace; presentation never changes a holding.
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
  const nameId = useId();
  const { currency, format: formatCurrency } = useDisplayCurrency();
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
      className="finance-card holding-card h-full py-0"
      data-testid="product-card"
    >
      <Card.Header className="p-6 pb-5">
        <div className="flex min-w-0 items-start gap-3">
          <HoldingIdentity category={product.assetCategory} />
          <div className="min-w-0 flex-1">
            <h3
              id={nameId}
              className="text-base font-semibold leading-6 tracking-tight text-foreground [overflow-wrap:anywhere]"
            >
              {product.name}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Chip
                size="sm"
                variant="secondary"
                className="text-[10px] font-medium"
              >
                {isYahoo ? product.yahoo.symbol : product.custom.currency}
              </Chip>
              <span className="text-xs text-muted-foreground">
                {assetCategoryLabel(product.assetCategory)}
              </span>
            </div>
          </div>
        </div>
      </Card.Header>

      <Card.Content className="flex flex-1 flex-col px-6 pb-5">
        <div className="mb-6 border-b border-separator pb-6">
          <p className="mb-2 text-xs text-muted-foreground">Current value</p>
          <p
            key={currency}
            className="display-number value-change font-sans text-[1.75rem] font-semibold leading-tight text-foreground"
          >
            {formatCurrency(totalValue)}
          </p>
          <p
            className={`display-number mt-2 text-sm font-medium tracking-normal ${isPositive ? 'text-gain' : 'text-loss'}`}
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
        <div
          role="group"
          aria-label={`Estimated profit for ${product.name}`}
          className="mt-6 rounded-xl bg-surface-secondary p-3.5"
        >
          <ProfitRateDisplay
            profitRates={calculateProductProfitRates({
              currentValueEur: totalValue,
              expectedAnnualReturn: expectedAnnualReturn ?? null,
            })}
          />
        </div>
      </Card.Content>
      {(onView || onEdit || onDelete) && (
        <Card.Footer className="mx-6 border-t border-separator px-0 py-2.5">
          <div
            className="flex w-full flex-wrap items-center gap-1"
            role="group"
            aria-label={`Actions for ${product.name}`}
          >
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => onView(product)}
                aria-label="View product history"
                aria-describedby={nameId}
                className="mr-auto min-h-11 gap-2 rounded-xl text-xs font-medium"
              >
                <Eye aria-hidden size={16} />
                History
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                isIconOnly
                onPress={() => onEdit(product)}
                aria-label="Edit product"
                aria-describedby={nameId}
                className="min-h-11 min-w-11 rounded-xl"
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
                aria-describedby={nameId}
                className="min-h-11 min-w-11 rounded-xl text-muted-foreground hover:text-loss"
              >
                <TrashSimple aria-hidden size={16} />
              </Button>
            )}
          </div>
        </Card.Footer>
      )}
      <p className="px-6 pb-4 text-[10px] text-muted-foreground">
        {dateString}
      </p>
    </Card>
  );
}
