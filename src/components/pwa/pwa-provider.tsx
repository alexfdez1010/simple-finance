'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { registerServiceWorker } from '@/lib/pwa/register-service-worker';

interface InstallPrompt extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface Installation {
  installed: boolean;
  available: boolean;
  ios: boolean;
  install(): Promise<void>;
}

const InstallationContext = createContext<Installation | null>(null);

/** Subscribes to the browser's standalone state and releases the listener when the consumer unmounts. */
function subscribeDisplay(onChange: () => void) {
  const display = window.matchMedia('(display-mode: standalone)');
  display.addEventListener('change', onChange);
  return () => display.removeEventListener('change', onChange);
}

/** Reads standalone mode in modern browsers and older iOS without mutating browser state. */
function getStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Identifies iPhone/iPad installation instructions, including iPad's desktop user agent. */
function getIos() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** Keeps server markup deterministic until the browser provides its platform capabilities. */
function getServerSnapshot() {
  return false;
}

/** Captures the browser's one-use install prompt across route changes and registers offline support. */
export function PwaProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [completed, setInstalled] = useState(false);
  const standalone = useSyncExternalStore(
    subscribeDisplay,
    getStandalone,
    getServerSnapshot,
  );
  const ios = useSyncExternalStore(subscribeDisplay, getIos, getServerSnapshot);
  const installed = completed || standalone;

  useEffect(() => {
    void registerServiceWorker();

    /** Stores the prompt without opening a dialog until the user requests installation. */
    function onPrompt(event: Event) {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    }
    /** Removes installation controls when the browser reports completion. */
    function onInstalled() {
      setInstalled(true);
      setPrompt(null);
    }
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  /** Consumes a prompt once; dismissal or failure falls back to the browser's installation menu. */
  async function install() {
    if (!prompt) return;
    setPrompt(null);
    try {
      const result = await prompt.prompt();
      if (result.outcome === 'accepted') setInstalled(true);
    } catch {
      // The browser may invalidate a captured prompt after a navigation.
    }
  }

  return (
    <InstallationContext.Provider
      value={{ installed, available: Boolean(prompt), ios, install }}
    >
      {children}
    </InstallationContext.Provider>
  );
}

/** Reads installation capabilities; requires PwaProvider and performs no browser side effects. */
export function useInstallation(): Installation {
  const installation = useContext(InstallationContext);
  if (!installation) throw new Error('useInstallation requires PwaProvider');
  return installation;
}
