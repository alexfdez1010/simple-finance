import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PwaProvider } from '@/components/pwa/pwa-provider';
import { InstallApp } from '@/components/pwa/install-app';
import { registerServiceWorker } from '@/lib/pwa/register-service-worker';

vi.mock('@/lib/pwa/register-service-worker', () => ({
  registerServiceWorker: vi.fn(),
}));
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement('img', props),
}));

/** Mounts installation within its persistent provider, like the root layout. */
function renderInstallation() {
  return render(
    <PwaProvider>
      <InstallApp />
    </PwaProvider>,
  );
}

/** Dispatches a browser-supplied install opportunity with a controllable native dialog. */
function offerInstall(outcome: 'accepted' | 'dismissed' = 'accepted') {
  const prompt = vi.fn().mockResolvedValue({ outcome });
  const event = Object.assign(
    new Event('beforeinstallprompt', { cancelable: true }),
    { prompt },
  );
  act(() => {
    window.dispatchEvent(event);
  });
  return { event, prompt };
}

describe('PWA installation', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('registers support and offers the native dialog only after a click', async () => {
    renderInstallation();
    expect(registerServiceWorker).toHaveBeenCalled();
    const { event, prompt } = offerInstall();
    expect(event.defaultPrevented).toBe(true);
    expect(prompt).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Install app' }));
    await waitFor(() => expect(prompt).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(screen.queryByText('Install Simple Finance')).toBeNull(),
    );
  });

  it('consumes dismissed prompts and waits for a fresh opportunity', async () => {
    renderInstallation();
    const { prompt } = offerInstall('dismissed');
    fireEvent.click(screen.getByRole('button', { name: 'Install app' }));
    await waitFor(() => expect(prompt).toHaveBeenCalledOnce());
    expect(screen.queryByRole('button', { name: 'Install app' })).toBeNull();
    expect(screen.getByText(/Open your browser menu/)).toBeTruthy();
    offerInstall();
    expect(screen.getByRole('button', { name: 'Install app' })).toBeTruthy();
  });

  it('falls back to instructions if the browser invalidates a prompt', async () => {
    renderInstallation();
    const { prompt } = offerInstall();
    prompt.mockRejectedValueOnce(new Error('Expired'));
    fireEvent.click(screen.getByRole('button', { name: 'Install app' }));
    await waitFor(() => expect(prompt).toHaveBeenCalledOnce());
    expect(screen.getByText(/Open your browser menu/)).toBeTruthy();
  });

  it('shows iOS instructions, including iPad desktop mode', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 5,
    });
    renderInstallation();
    expect(screen.getByText(/In Safari, open Share/)).toBeTruthy();
    Reflect.deleteProperty(navigator, 'maxTouchPoints');
  });

  it('hides after installation completes', () => {
    renderInstallation();
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(screen.queryByText('Install Simple Finance')).toBeNull();
  });

  it('hides inside standalone windows and removes listeners on unmount', () => {
    const removeEventListener = vi.fn();
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener,
    } as unknown as MediaQueryList);
    const view = renderInstallation();
    expect(screen.queryByText('Install Simple Finance')).toBeNull();
    view.unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });
});
