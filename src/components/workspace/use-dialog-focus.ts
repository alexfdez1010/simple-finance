'use client';

import { useEffect, useRef } from 'react';

/**
 * Preserves the opening control across conditionally mounted, lazy dialogs.
 * @param isOpen - Whether any workspace dialog is currently mounted.
 * @returns A state-opening adapter that remembers focus before mounting a dialog.
 * Restores focus after unmount; pending or failed actions keep their dialog focus.
 * A deleted opener falls back to the main workspace, and cleanup cancels stale work.
 */
export function useDialogFocus(isOpen: boolean) {
  const trigger = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const justClosed = wasOpen.current && !isOpen;
    wasOpen.current = isOpen;
    if (!justClosed) return;

    const opener = trigger.current;
    const frame = requestAnimationFrame(() => {
      const target = opener?.isConnected
        ? opener
        : document.getElementById('main-content');
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  /**
   * Captures focus before a dialog setter can mount its focus scope.
   * @param setTarget - The focused dialog's local state setter.
   * @param target - Product or source that opens the requested dialog.
   * @returns Nothing; stores the opener and delegates state to the caller.
   */
  function openDialog<T>(setTarget: (value: T) => void, target: T): void {
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setTarget(target);
  }

  return openDialog;
}
