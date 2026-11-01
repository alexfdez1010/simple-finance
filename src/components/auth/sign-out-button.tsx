'use client';
import { useState } from 'react';
import { SignOut } from '@phosphor-icons/react';
import { authClient } from '@/lib/auth/client';

/** Revokes the current session; failed requests retain the page and expose a retryable error. */
export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  /** Waits for confirmed revocation before navigating to sign-in. */
  async function signOut() {
    setBusy(true);
    setError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error('Sign-out failed');
      window.location.assign('/auth');
    } catch {
      setError(true);
      setBusy(false);
    }
  }
  return (
    <div>
      <button
        onClick={signOut}
        disabled={busy}
        className="flex min-h-11 min-w-11 items-center justify-center lg:justify-start gap-2 rounded-lg px-2 text-sm text-muted-foreground hover:bg-default hover:text-foreground disabled:opacity-50"
      >
        <SignOut aria-hidden size={18} />
        <span className="sr-only lg:not-sr-only">
          {busy ? 'Signing out…' : 'Sign out'}
        </span>
      </button>
      {error && (
        <p role="alert" className="text-xs text-danger">
          Could not sign out. Try again.
        </p>
      )}
    </div>
  );
}
