'use client';

import Image from 'next/image';
import { useInstallation } from './pwa-provider';

/** Offers native installation when available, platform instructions otherwise; hides inside the installed app. */
export function InstallApp() {
  const { installed, available, ios, install } = useInstallation();
  if (installed) return null;

  return (
    <section
      aria-labelledby="install-heading"
      className="max-w-2xl space-y-5 rounded-2xl bg-card p-5 sm:p-8"
    >
      <div className="flex items-center gap-4">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={48}
          height={48}
          unoptimized
          className="rounded-xl"
        />
        <h2 id="install-heading" className="text-xl font-semibold">
          Install Simple Finance
        </h2>
      </div>
      {available ? (
        <button
          type="button"
          onClick={install}
          className="min-h-12 rounded-xl bg-foreground px-5 text-sm text-background"
        >
          Install app
        </button>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">
          {ios
            ? 'In Safari, open Share, choose Add to Home Screen, then Add. If shown, keep Open as Web App enabled.'
            : 'Open your browser menu and choose Install app or Add to Home Screen. If the option is missing, open this page in Chrome on Android or Safari on iPhone.'}
        </p>
      )}
    </section>
  );
}
