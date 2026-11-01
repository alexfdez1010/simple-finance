'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { saveRunwaySettingsAction } from '@/lib/actions/runway-actions';
import { computeSafeRunwayProjection } from '@/lib/domain/services/safe-runway-projection';
import type {
  RunwayHolding,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';
import { RunwayFields } from './runway-fields';
import { readRunwayForm } from './runway-form-data';
import { RunwayResults } from './runway-results';
import { RunwayCharts } from './runway-charts';

/** Provides immediate validated previews and explicitly saves assumptions; failed saves retain the form. */
export function RunwayWorkspace({
  products,
  settings,
}: {
  products: RunwayHolding[];
  settings: RunwaySettings | null;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(settings);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const calculation = draft
    ? computeSafeRunwayProjection(products, draft)
    : null;
  const projection = calculation?.projection;

  /** Updates the preview only for valid inputs, clearing stale success feedback. */
  function preview(event: FormEvent<HTMLFormElement>) {
    const result = readRunwayForm(event.currentTarget);
    setDraft(result.success ? result.data : null);
    setMessage(
      result.success ? '' : 'Check the amounts and percentages in your plan.',
    );
  }

  /** Persists a validated snapshot; edits are disabled until the result is confirmed. */
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = readRunwayForm(event.currentTarget);
    if (!result.success) {
      setMessage('Check the amounts and percentages before saving.');
      return;
    }
    startTransition(async () => {
      try {
        const response = await saveRunwaySettingsAction(result.data);
        if (!response.success) {
          setMessage(response.error ?? 'Could not save. Please try again.');
          return;
        }
        setSaved(result.data);
        setMessage('Settings saved');
        router.refresh();
      } catch {
        setMessage('Could not save. Please try again.');
      }
    });
  }

  return (
    <div className="space-y-6">
      <form
        onChange={preview}
        onSubmit={save}
        className="finance-card p-5 sm:p-6"
      >
        <fieldset disabled={pending} className="min-w-0">
          <legend className="sr-only">Your monthly cost</legend>
          <RunwayFields
            settings={settings}
            actions={
              <Button
                type="submit"
                disabled={pending || !draft || !dirty}
                className="h-12 w-full px-6 lg:w-auto"
              >
                {pending ? 'Saving…' : 'Save settings'}
              </Button>
            }
          />
        </fieldset>
        <p
          role="status"
          className={
            message || dirty ? 'mt-3 text-xs text-muted-foreground' : 'sr-only'
          }
        >
          {message || (dirty ? 'Unsaved preview' : '')}
        </p>
      </form>
      {projection && draft ? (
        <RunwayResults projection={projection} settings={draft} />
      ) : (
        <div className="flex min-h-48 items-center justify-center rounded-2xl bg-card p-8 text-center text-muted-foreground">
          {calculation?.error ??
            'Enter your monthly living cost to see the projection'}
        </div>
      )}
      {projection && draft && (
        <RunwayCharts projection={projection} settings={draft} />
      )}
    </div>
  );
}
