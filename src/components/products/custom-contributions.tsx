/**
 * Inline list of contributions (deposits & withdrawals) for a custom product
 * with add/edit/delete actions. The list is rendered ascending by date and
 * amounts are always shown in the product's currency.
 *
 * @module components/products/custom-contributions
 */

'use client';

import { Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { currencySymbol } from '@/components/products/currency-options';
import { FormError } from '@/components/products/form-actions';
import { ContributionFormRow } from '@/components/products/contribution-form-row';
import { ContributionRow } from '@/components/products/contribution-row';
import { useContributionsEditor } from '@/components/products/use-contributions-editor';
import { calculateNetInvestedFromContributions } from '@/lib/domain/services/custom-product-calculator';
import type { CustomContribution } from '@/lib/domain/models/product.types';

interface Props {
  customProductDataId: string;
  currency: string;
  contributions: CustomContribution[];
  onChanged: () => void;
}

/**
 * Renders the contribution list and an inline form to add or edit one.
 * Withdrawals are entered as negative amounts. All amounts are persisted
 * in the product's currency — no EUR conversion happens on save.
 */
export function CustomContributions({
  customProductDataId,
  currency,
  contributions,
  onChanged,
}: Props) {
  const editor = useContributionsEditor({
    customProductDataId,
    initial: contributions,
    onChanged,
  });
  const symbol = currencySymbol(currency);
  // Net total of every movement (deposits minus withdrawals), rounded to
  // avoid floating-point noise while keeping crypto's decimal precision.
  const total = Number(
    calculateNetInvestedFromContributions(editor.items).toFixed(8),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Movements ({editor.items.length}) · {currency}
        </h3>
        {editor.editing !== 'new' && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={editor.startNew}
            disabled={editor.busy}
          >
            <Plus aria-hidden size={16} weight="bold" /> Add movement
          </Button>
        )}
      </div>

      <ul className="flex flex-col divide-y divide-border rounded-md bg-muted/20">
        {editor.items.length === 0 && editor.editing !== 'new' && (
          <li className="px-3 py-3 text-xs text-muted-foreground">
            No movements yet. Add the first deposit.
          </li>
        )}
        {editor.items.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between px-3 py-2 text-sm"
          >
            {editor.editing === c.id ? (
              <ContributionFormRow
                form={editor.form}
                setForm={editor.setForm}
                symbol={symbol}
                onCancel={editor.cancel}
                onSave={editor.submit}
                busy={editor.busy}
              />
            ) : (
              <ContributionRow
                contribution={c}
                symbol={symbol}
                busy={editor.busy}
                onEdit={() => editor.startEdit(c)}
                onDelete={() => editor.remove(c.id)}
              />
            )}
          </li>
        ))}
        {editor.editing === 'new' && (
          <li className="px-3 py-2">
            <ContributionFormRow
              form={editor.form}
              setForm={editor.setForm}
              symbol={symbol}
              onCancel={editor.cancel}
              onSave={editor.submit}
              busy={editor.busy}
            />
          </li>
        )}
        {editor.items.length > 0 && (
          <li className="flex items-center justify-between bg-muted/60 px-3 py-2 text-sm">
            <span className="font-semibold text-foreground">Total</span>
            <span
              className={`font-mono font-semibold ${
                total >= 0 ? 'text-gain' : 'text-loss'
              }`}
            >
              {total >= 0 ? '+' : ''}
              {total} {symbol}
            </span>
          </li>
        )}
      </ul>

      <FormError error={editor.error} />
    </div>
  );
}
