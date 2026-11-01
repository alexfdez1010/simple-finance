'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import { safeRedirect } from '@/lib/auth/redirect';

/** Completes a pending sign-in with TOTP or a single-use recovery code, preserving OAuth context. */
export function TwoFactorChallenge() {
  const search = useSearchParams();
  const [backup, setBackup] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  /** Verifies through Better Auth; OAuth redirects are performed by its client after session creation. */
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = backup
        ? await authClient.twoFactor.verifyBackupCode({
            code: code.trim(),
            trustDevice: false,
          })
        : await authClient.twoFactor.verifyTotp({
            code: code.trim(),
            trustDevice: false,
          });
      if (result.error) {
        setError('Invalid or expired code. Try again.');
        setBusy(false);
        return;
      }
      const data = result.data as { redirect?: boolean; url?: string } | null;
      if (data?.redirect && data.url) return;
      window.location.assign(safeRedirect(search.get('redirectTo')));
    } catch {
      setError('Could not connect. Try again.');
      setBusy(false);
    }
  }
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-6 py-12"
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Verify your sign-in
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {backup
            ? 'Enter one of your recovery codes'
            : 'Enter the code from your authenticator app'}
        </p>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <label className="grid gap-2 text-sm font-medium">
          {backup ? 'Recovery code' : 'Authentication code'}
          <input
            autoComplete="one-time-code"
            autoFocus
            required
            inputMode={backup ? 'text' : 'numeric'}
            pattern={backup ? undefined : '[0-9]{6}'}
            maxLength={backup ? 32 : 6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            disabled={busy}
            className="min-h-12 rounded-xl border border-input bg-card px-4 font-mono outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <button
          disabled={busy}
          className="min-h-12 w-full rounded-xl bg-foreground px-4 text-background disabled:opacity-50"
        >
          {busy ? 'Verifying…' : 'Verify'}
        </button>
      </form>
      <button
        disabled={busy}
        onClick={() => {
          setBackup(!backup);
          setCode('');
          setError('');
        }}
        className="min-h-11 text-sm underline underline-offset-4"
      >
        {backup ? 'Use authenticator app' : 'Use a recovery code'}
      </button>
      <Link
        href={`/auth?${search.toString()}`}
        className="text-center text-sm text-muted-foreground"
      >
        Back to sign in
      </Link>
    </main>
  );
}
