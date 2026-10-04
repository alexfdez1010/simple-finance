import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CopyButton } from '@/components/ui/copy-button';

const writeText = vi.fn<(value: string) => Promise<void>>();

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('CopyButton', () => {
  it('copies its value, announces success, then restores its custom label', async () => {
    vi.useFakeTimers();
    writeText.mockResolvedValueOnce(undefined);
    render(<CopyButton value="secret-token" label="Copy token" />);

    await act(async () => fireEvent.click(screen.getByRole('button')));

    expect(writeText).toHaveBeenCalledWith('secret-token');
    expect(screen.getByRole('button').textContent).toBe('Copied');
    expect(screen.getByRole('status').textContent).toBe('Copied to clipboard.');

    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByRole('button').textContent).toBe('Copy token');
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('exposes clipboard denial and allows a successful retry', async () => {
    writeText.mockRejectedValueOnce(
      new DOMException('Denied', 'NotAllowedError'),
    );
    writeText.mockResolvedValueOnce(undefined);
    render(<CopyButton value="token" />);

    await act(async () => fireEvent.click(screen.getByRole('button')));

    expect(screen.getByRole('status').textContent).toBe(
      'Copy failed. Try again.',
    );
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(false);
    await act(async () => fireEvent.click(screen.getByRole('button')));
    expect(writeText).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('status').textContent).toBe('Copied to clipboard.');
  });

  it('disables the button and ignores repeated clicks during a pending write', async () => {
    let finish!: () => void;
    writeText.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    render(<CopyButton value="token" />);

    await act(async () => fireEvent.click(screen.getByRole('button')));
    expect(screen.getByRole('button').textContent).toBe('Copying…');
    expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
    await act(async () => fireEvent.click(screen.getByRole('button')));
    expect(writeText).toHaveBeenCalledTimes(1);

    await act(async () => finish());
    expect(screen.getByRole('button').textContent).toBe('Copied');
  });

  it('clears a scheduled feedback reset when unmounted', async () => {
    vi.useFakeTimers();
    writeText.mockResolvedValueOnce(undefined);
    const { unmount } = render(<CopyButton value="token" />);
    await act(async () => fireEvent.click(screen.getByRole('button')));

    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not schedule feedback when a write completes after unmount', async () => {
    vi.useFakeTimers();
    let finish!: () => void;
    writeText.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    const { unmount } = render(<CopyButton value="token" />);
    fireEvent.click(screen.getByRole('button'));
    unmount();

    await act(async () => finish());
    expect(vi.getTimerCount()).toBe(0);
  });
});
