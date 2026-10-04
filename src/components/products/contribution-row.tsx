/**
 * Read-only display row for a single contribution.
 * Shows the amount in the product currency, the date and optional note,
 * plus edit/delete action buttons.
 *
 * @module components/products/contribution-row
 */

'use client';

import { PencilSimple, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { CustomContribution } from '@/lib/domain/models/product.types';

interface Props {
  contribution: CustomContribution;
  symbol: string;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Renders a movement in its original currency without truncating amounts or notes.
 * @param props - Movement, currency symbol, pending state and action callbacks.
 * @returns Wrapping movement details and touch-sized edit/delete controls.
 * Actions invoke callbacks; busy blocks them. Missing notes show only the UTC date.
 */
export function ContributionRow({
  contribution: c,
  symbol,
  busy,
  onEdit,
  onDelete,
}: Props) {
  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={`break-all font-mono tabular-nums ${c.amount >= 0 ? 'text-gain' : 'text-loss'}`}
        >
          {c.amount >= 0 ? '+' : ''}
          {c.amount} {symbol}
        </span>
        <span className="text-[11px] text-muted-foreground [overflow-wrap:anywhere]">
          {new Date(c.date).toISOString().split('T')[0]}
          {c.note ? ` · ${c.note}` : ''}
        </span>
      </div>
      <div className="ml-2 flex shrink-0 gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onEdit}
          disabled={busy}
          aria-label="Edit movement"
          className="min-h-11 min-w-11"
        >
          <PencilSimple aria-hidden size={16} weight="bold" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          disabled={busy}
          aria-label="Delete movement"
          className="min-h-11 min-w-11 text-destructive hover:text-destructive"
        >
          <Trash aria-hidden size={16} weight="bold" />
        </Button>
      </div>
    </>
  );
}
