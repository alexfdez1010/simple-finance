/**
 * State + actions for the inline contributions editor.
 * Encapsulates the optimistic list updates and the server-action calls so
 * the rendering component stays presentational.
 *
 * @module components/products/use-contributions-editor
 */

'use client';

import { useEffect, useState } from 'react';
import {
  addContributionAction,
  updateContributionAction,
  deleteContributionAction,
} from '@/lib/actions/contribution-actions';
import type { ContributionFormState } from '@/components/products/contribution-form-row';
import type { CustomContribution } from '@/lib/domain/models/product.types';

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

const sortByDate = (list: CustomContribution[]) =>
  [...list].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

interface Options {
  customProductDataId: string;
  initial: CustomContribution[];
  onChanged: () => void;
}

/**
 * Returns the full state machine for the contributions editor: items,
 * the in-progress edit target, the form state, busy/error flags, and
 * action callbacks (start new/edit, cancel, submit, remove).
 */
export function useContributionsEditor({
  customProductDataId,
  initial,
  onChanged,
}: Options) {
  const [items, setItems] = useState<CustomContribution[]>(() =>
    sortByDate(initial),
  );
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<ContributionFormState>(emptyForm());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(sortByDate(initial));
  }, [initial]);

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

  return {
    items,
    editing,
    form,
    setForm,
    busy,
    error,
    startNew,
    startEdit,
    cancel,
    submit,
    remove,
  };
}
