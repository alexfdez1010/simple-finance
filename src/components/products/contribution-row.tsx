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

export function ContributionRow({
  contribution: c,
  symbol,
  busy,
  onEdit,
  onDelete,
}: Props) {
  return (
    <>
      <div className="flex flex-col">
        <span
          className={`font-mono ${c.amount >= 0 ? 'text-gain' : 'text-loss'}`}
        >
          {c.amount >= 0 ? '+' : ''}
          {c.amount} {symbol}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {new Date(c.date).toISOString().split('T')[0]}
          {c.note ? ` · ${c.note}` : ''}
        </span>
      </div>
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onEdit}
          disabled={busy}
          aria-label="Edit movement"
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
          className="text-destructive hover:text-destructive"
        >
          <Trash aria-hidden size={16} weight="bold" />
        </Button>
      </div>
    </>
  );
}
