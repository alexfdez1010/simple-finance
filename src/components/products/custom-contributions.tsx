/**
 * Inline list of contributions (deposits & withdrawals) for a custom product
 * with add/edit/delete actions. The list is rendered in the order returned
 * by the server (ascending by date).
 *
 * @module components/products/custom-contributions
 */

'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  addContributionAction,
  updateContributionAction,
  deleteContributionAction,
} from '@/lib/actions/contribution-actions';
import { Button } from '@/components/ui/button';
import { currencySymbol } from '@/components/products/currency-options';
import { FormError } from '@/components/products/form-actions';
import {
  ContributionFormRow,
  type ContributionFormState,
} from '@/components/products/contribution-form-row';
import type { CustomContribution } from '@/lib/domain/models/product.types';

interface Props {
  customProductDataId: string;
  currency: string;
  contributions: CustomContribution[];
  onChanged: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

const emptyForm = (): ContributionFormState => ({
  amount: '',
  date: today(),
  note: '',
});

const toFormState = (c: CustomContribution): ContributionFormState => ({
  amount: c.amount.toString(),
  date: new Date(c.date).toISOString().split('T')[0],
  note: c.note ?? '',
});

/**
 * Renders the contribution list and an inline form to add or edit one.
 * Withdrawals are entered as negative amounts.
 */
const sortByDate = (list: CustomContribution[]) =>
  [...list].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

export function CustomContributions({
  customProductDataId,
  currency,
  contributions,
  onChanged,
}: Props) {
  const [items, setItems] = useState<CustomContribution[]>(() =>
    sortByDate(contributions),
  );
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<ContributionFormState>(emptyForm());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const symbol = currencySymbol(currency);

  useEffect(() => {
    setItems(sortByDate(contributions));
  }, [contributions]);

  const startNew = () => {
    setEditing('new');
    setForm(emptyForm());
    setError(null);
  };

  const startEdit = (c: CustomContribution) => {
    setEditing(c.id);
    setForm(toFormState(c));
    setError(null);
  };

  const cancel = () => {
    setEditing(null);
    setError(null);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    const amount = parseFloat(form.amount);
    if (Number.isNaN(amount)) {
      setError('Amount must be a number');
      setBusy(false);
      return;
    }
    const date = new Date(form.date);
    const note = form.note.trim() || null;
    const isNew = editing === 'new';
    const result = isNew
      ? await addContributionAction(customProductDataId, amount, date, note)
      : await updateContributionAction(editing as string, amount, date, note);
    setBusy(false);
    if (!result.success) {
      setError(result.error ?? 'Failed to save contribution');
      return;
    }
    const id = result.id ?? (editing as string);
    const next: CustomContribution = {
      id,
      amount,
      date,
      note,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems((prev) =>
      sortByDate(
        isNew ? [...prev, next] : prev.map((c) => (c.id === id ? next : c)),
      ),
    );
    setEditing(null);
    onChanged();
  };

  const remove = async (id: string) => {
    setBusy(true);
    setError(null);
    const result = await deleteContributionAction(id);
    setBusy(false);
    if (!result.success) {
      setError(result.error ?? 'Failed to delete contribution');
      return;
    }
    setItems((prev) => prev.filter((c) => c.id !== id));
    onChanged();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Movements ({items.length})
        </h3>
        {editing !== 'new' && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={startNew}
            disabled={busy}
          >
            <Plus className="mr-1" /> Add movement
          </Button>
        )}
      </div>

      <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
        {items.length === 0 && editing !== 'new' && (
          <li className="px-3 py-3 text-xs text-muted-foreground">
            No movements yet. Add the first deposit.
          </li>
        )}
        {items.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between px-3 py-2 text-sm"
          >
            {editing === c.id ? (
              <ContributionFormRow
                form={form}
                setForm={setForm}
                symbol={symbol}
                onCancel={cancel}
                onSave={submit}
                busy={busy}
              />
            ) : (
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
                    onClick={() => startEdit(c)}
                    disabled={busy}
                    aria-label="Edit movement"
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => remove(c.id)}
                    disabled={busy}
                    aria-label="Delete movement"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
        {editing === 'new' && (
          <li className="px-3 py-2">
            <ContributionFormRow
              form={form}
              setForm={setForm}
              symbol={symbol}
              onCancel={cancel}
              onSave={submit}
              busy={busy}
            />
          </li>
        )}
      </ul>

      <FormError error={error} />
    </div>
  );
}
