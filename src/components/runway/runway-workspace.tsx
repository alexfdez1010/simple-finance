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
import { RunwayFields, RunwayNumberField } from './runway-fields';
import { readRunwayForm } from './runway-form-data';
import { RunwayResults } from './runway-results';
import { RunwayCharts } from './runway-charts';
import { FireResults } from './fire-results';
import { RunwayAssumptions } from './runway-assumptions';

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
    <form onChange={preview} onSubmit={save} className="space-y-8">
      <fieldset disabled={pending} className="min-w-0 space-y-8">
        <legend className="sr-only">Your monthly cost</legend>
        <div className="finance-card p-5 sm:p-6">
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
          <p
            role="status"
            className={
              message || dirty
                ? 'mt-3 text-xs text-muted-foreground'
                : 'sr-only'
            }
          >
            {message || (dirty ? 'Unsaved preview' : '')}
          </p>
        </div>
        <section aria-labelledby="runway-heading" className="space-y-4">
          <h2 id="runway-heading" className="text-xl font-semibold">
            Runway
          </h2>
          {projection && draft ? (
            <div className="grid gap-5 xl:grid-cols-2">
              <RunwayResults projection={projection} settings={draft} />
              <RunwayCharts
                projection={projection}
                settings={draft}
                scenario="runway"
              />
            </div>
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-2xl bg-card p-8 text-center text-muted-foreground">
              {calculation?.error ??
                'Enter your monthly living cost to see the projection'}
            </div>
          )}
        </section>
        <section aria-labelledby="fire-heading" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="fire-heading" className="text-xl font-semibold">
              FIRE
            </h2>
            <div className="w-full sm:max-w-sm">
              <RunwayNumberField
                name="monthlyContribution"
                label="Monthly investment after living costs (EUR)"
                value={settings?.monthlyContribution ?? 0}
                prominent
              />
            </div>
          </div>
          {projection && draft && (
            <div className="grid gap-5 xl:grid-cols-2">
              <FireResults projection={projection} />
              <RunwayCharts
                projection={projection}
                settings={draft}
                scenario="fire"
              />
            </div>
          )}
        </section>
        {projection && draft && (
          <RunwayAssumptions projection={projection} settings={draft} />
        )}
      </fieldset>
    </form>
  );
}
