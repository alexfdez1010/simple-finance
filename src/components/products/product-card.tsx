/**
 * Product card component for displaying financial product information
 * @module components/products/product-card
 */

'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

interface ProductCardProps {
  product: FinancialProduct;
  currentValue?: number;
  onEdit?: (product: FinancialProduct) => void;
  onDelete?: (product: FinancialProduct) => void;
}

/**
 * Formats currency value in EUR
 *
 * @param value - Value to format
 * @returns Formatted currency string in EUR
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

/**
 * Formats percentage value
 *
 * @param value - Value to format
 * @returns Formatted percentage string
 */
function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/**
 * Product card with enhanced visual design and dialog-based actions
 *
 * @param props - Component props
 * @returns Product card element
 */
export function ProductCard({
  product,
  currentValue = 0,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const isYahoo = product.type === 'YAHOO_FINANCE';
  const totalValue = currentValue * product.quantity;
  const [dateString, setDateString] = useState('');

  let returnValue = 0;
  let returnPct = 0;
  let initialInvestment = 0;

  if (isYahoo && product.yahoo) {
    initialInvestment = product.yahoo.purchasePrice * product.quantity;
  } else if (!isYahoo && product.custom) {
    initialInvestment = product.custom.initialInvestment * product.quantity;
  }
  returnValue = totalValue - initialInvestment;
  returnPct =
    initialInvestment > 0 ? (returnValue / initialInvestment) * 100 : 0;

  const isPositive = returnValue >= 0;

  useEffect(() => {
    setDateString(new Date(product.createdAt).toLocaleDateString());
  }, [product.createdAt]);

  return (
    <div className="group bg-card rounded-xl glass-card p-5 border border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1 mr-2">
          <h3 className="text-base font-semibold text-foreground truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[10px]">
              {isYahoo ? product.yahoo.symbol : 'Custom'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(product)}
              aria-label="Edit product"
            >
              <Pencil />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(product)}
              aria-label="Delete product"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            Quantity
          </p>
          <p className="text-sm font-semibold text-foreground tabular-nums">
            {product.quantity}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            {isYahoo ? 'Unit Price' : 'Annual Rate'}
          </p>
          <p className="text-sm font-semibold text-foreground tabular-nums">
            {isYahoo
              ? formatCurrency(currentValue)
              : formatPercentage(product.custom.annualReturnRate * 100)}
          </p>
        </div>
      </div>

      {/* Current Value */}
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
          Current Value
        </p>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Return */}
      <div className="flex justify-between items-center pt-3 border-t border-border">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            Return
          </p>
          <p
            className={`text-sm font-semibold tabular-nums ${isPositive ? 'text-gain' : 'text-loss'}`}
          >
            {formatCurrency(returnValue)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            Return %
          </p>
          <p
            className={`text-sm font-semibold tabular-nums ${isPositive ? 'text-gain' : 'text-loss'}`}
          >
            {formatPercentage(returnPct)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground mt-3">
        Added {dateString}
      </p>
    </div>
  );
}
