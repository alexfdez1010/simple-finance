import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDialogFocus } from '@/components/workspace/use-dialog-focus';

let elements: HTMLDivElement;
let opener: HTMLButtonElement;
let main: HTMLElement;
let callbacks: Map<number, FrameRequestCallback>;
let nextFrame: number;

beforeEach(() => {
  callbacks = new Map();
  nextFrame = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callbacks.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (frame: number) => {
    callbacks.delete(frame);
  });
  elements = document.createElement('div');
  elements.innerHTML =
    '<button>Open dialog</button><main id="main-content" tabindex="-1"></main>';
  document.body.append(elements);
  opener = elements.querySelector('button')!;
  main = elements.querySelector('main')!;
});

afterEach(() => {
  cleanup();
  elements.remove();
  vi.unstubAllGlobals();
});

/** Executes only uncancelled animation frames, simulating the next browser paint. */
function paint() {
  const pending = [...callbacks.values()];
  callbacks.clear();
  act(() => pending.forEach((callback) => callback(0)));
}

/**
 * Opens the hook from a real focusable trigger, then moves focus into its dialog.
 * @returns The hook controls for closing, interrupting, or unmounting the dialog.
 */
function openFromTrigger() {
  const hook = renderHook(({ isOpen }) => useDialogFocus(isOpen), {
    initialProps: { isOpen: false },
  });
  const setTarget = vi.fn();
  opener.focus();
  act(() => hook.result.current(setTarget, 'custom'));
  expect(setTarget).toHaveBeenCalledWith('custom');
  hook.rerender({ isOpen: true });
  main.focus();
  return hook;
}

describe('conditionally mounted dialog focus', () => {
  it('keeps focus inside open dialogs and restores the opener after close', () => {
    const hook = openFromTrigger();
    paint();
    expect(document.activeElement).toBe(main);
    hook.rerender({ isOpen: false });
    expect(document.activeElement).toBe(main);
    paint();
    expect(document.activeElement).toBe(opener);
  });

  it('returns to the workspace when a successful deletion removed the opener', () => {
    const hook = openFromTrigger();
    opener.remove();
    hook.rerender({ isOpen: false });
    paint();
    expect(document.activeElement).toBe(main);
  });

  it('does not steal focus when another dialog opens before the next paint', () => {
    const hook = openFromTrigger();
    hook.rerender({ isOpen: false });
    hook.rerender({ isOpen: true });
    paint();
    expect(document.activeElement).toBe(main);
    expect(callbacks.size).toBe(0);
  });

  it('cancels pending restoration when the workspace unmounts', () => {
    const hook = openFromTrigger();
    hook.rerender({ isOpen: false });
    hook.unmount();
    paint();
    expect(document.activeElement).toBe(main);
    expect(callbacks.size).toBe(0);
  });
});
