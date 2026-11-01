'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import {
  MAX_BACKUP_BYTES,
  parseBackup,
  type FinanceBackup,
} from '@/lib/backup/backup-schema';

/**
 * Coordinates a portable copy with the current router and display-currency context.
 * @returns Preview, feedback, pending state and actions for download, selection, cancel and restore.
 * Reads chosen files locally; writes server data and browser currency only on confirmed restore.
 * Failed imports retain the preview, while uncertain network outcomes request a fresh export.
 */
export function useBackup() {
  const router = useRouter();
  const { currency, setCurrency } = useDisplayCurrency();
  const [pending, setPending] = useState<FinanceBackup | null>(null);
  const [busy, setBusy] = useState<'export' | 'read' | 'import' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const locked = useRef(false);

  /** Clears feedback and locks concurrent clicks until the current operation settles. */
  function begin(operation: 'export' | 'read' | 'import'): boolean {
    if (locked.current) return false;
    locked.current = true;
    setBusy(operation);
    setError(null);
    setMessage(null);
    return true;
  }

  /** Releases the synchronous operation lock and updates the visible pending state. */
  function finish(): void {
    locked.current = false;
    setBusy(null);
  }

  /** Fetches a consistent server copy and starts a JSON download; reports HTTP/network failures. */
  async function download(): Promise<void> {
    if (!begin('export')) return;
    try {
      const response = await fetch(`/api/backup?currency=${currency}`, {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error((await response.json()).error);
      const text = await response.text();
      const backup = parseBackup(text);
      const url = URL.createObjectURL(
        new Blob([text], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `simple-finance-${backup.exportedAt.slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('Backup download started.');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not export your data. Try again.',
      );
    } finally {
      finish();
    }
  }

  /** Reads one chosen file into a validated preview; never changes stored data. */
  async function choose(file: File): Promise<void> {
    if (!begin('read')) return;
    setPending(null);
    try {
      if (file.size > MAX_BACKUP_BYTES)
        throw new Error('The backup exceeds the 20 MB limit.');
      setPending(parseBackup(await file.text()));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not read this backup.',
      );
    } finally {
      finish();
    }
  }

  /** Cancels the preview without mutation; blocked during an active import. */
  function cancel(): void {
    if (!locked.current) {
      setPending(null);
      setError(null);
    }
  }

  /** Submits the confirmed replacement; keeps the preview available after a failed request. */
  async function restore(): Promise<void> {
    if (!pending || !begin('import')) return;
    let failureMessage =
      'Could not confirm the import. Export your data to check before retrying.';
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pending),
      });
      const result = await response.json();
      if (!response.ok) {
        failureMessage =
          result.error || 'Could not restore this backup. Try again.';
        throw new Error(failureMessage);
      }
      setCurrency(pending.preferences.displayCurrency);
      setPending(null);
      setMessage('Backup restored.');
      router.refresh();
    } catch {
      setError(failureMessage);
    } finally {
      finish();
    }
  }

  return { pending, busy, error, message, download, choose, cancel, restore };
}
