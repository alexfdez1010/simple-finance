/**
 * Small clipboard-copy button with transient "Copied" feedback.
 * @module components/ui/copy-button
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface CopyButtonProps {
  value: string;
  label?: string;
}

/**
 * Writes a value to the clipboard with accessible success and failure feedback.
 *
 * @param props - String to copy and optional button label (default "Copy").
 * @returns A copy control and a live feedback region.
 * @remarks Prevents duplicate writes; unmounting cancels feedback timers and
 * ignores pending results. Clipboard denial leaves the control ready to retry.
 */
export function CopyButton({ value, label = 'Copy' }: CopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'copied' | 'error'>(
    'idle',
  );
  const pending = useRef(false);
  const mounted = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timeout.current !== null) clearTimeout(timeout.current);
    };
  }, []);

  /**
   * Writes the current value once and updates live feedback.
   * @returns Completion after clipboard success or handled denial.
   * @remarks Concurrent clicks are ignored; unmounted results have no effect.
   */
  async function copy(): Promise<void> {
    if (pending.current) return;
    pending.current = true;
    if (timeout.current !== null) clearTimeout(timeout.current);
    setStatus('pending');
    try {
      await navigator.clipboard.writeText(value);
      if (!mounted.current) return;
      setStatus('copied');
      timeout.current = setTimeout(() => setStatus('idle'), 1500);
    } catch {
      if (mounted.current) setStatus('error');
    } finally {
      pending.current = false;
    }
  }

  return (
    <span className="inline-flex max-w-full flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={status === 'pending'}
        onClick={copy}
      >
        {status === 'copied'
          ? 'Copied'
          : status === 'pending'
            ? 'Copying…'
            : label}
      </Button>
      <span
        role="status"
        aria-live="polite"
        className={status === 'error' ? 'text-xs text-destructive' : 'sr-only'}
      >
        {status === 'error'
          ? 'Copy failed. Try again.'
          : status === 'copied'
            ? 'Copied to clipboard.'
            : status === 'pending'
              ? 'Copying to clipboard…'
              : ''}
      </span>
    </span>
  );
}
