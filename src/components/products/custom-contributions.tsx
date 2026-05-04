/**
 * Inline list of contributions (deposits & withdrawals) for a custom product
 * with add/edit/delete actions. The list is rendered ascending by date and
 * amounts are always shown in the product's currency.
 *
 * @module components/products/custom-contributions
 */

'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { currencySymbol } from '@/components/products/currency-options';
import { FormError } from '@/components/products/form-actions';
import { ContributionFormRow } from '@/components/products/contribution-form-row';
import { ContributionRow } from '@/components/products/contribution-row';
import { useContributionsEditor } from '@/components/products/use-contributions-editor';
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
            <Plus className="mr-1" /> Add movement
          </Button>
        )}
      </div>

      <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
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
      </ul>

      <FormError error={editor.error} />
    </div>
  );
}
