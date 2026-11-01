'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth/client';

/** Requires an authenticated, signed OAuth request and shows the requesting client's identity. */
export default function ConsentPage() {
  const search = useSearchParams();
  const clientId = search.get('client_id') || '';
  const [clientName, setClientName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    authClient.oauth2
      .publicClient({ query: { client_id: clientId } })
      .then(({ data, error }) => {
        if (!active) return;
        if (error)
          setError(
            'This authorization request is invalid or has expired. Reconnect from your assistant.',
          );
        else setClientName(data?.client_name || clientId);
      });
    return () => {
      active = false;
    };
  }, [clientId]);

  /** Approves or rejects the signed request; Better Auth validates scope, client, session and callback. */
  async function decide(accept: boolean) {
    setBusy(true);
    const { error } = await authClient.oauth2.consent({
      accept,
      oauth_query: search.toString(),
    });
    if (error) {
      setError('Could not authorize. Reconnect from your assistant.');
      setBusy(false);
      return;
    }
  }
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6"
    >
      <h1 className="text-3xl font-semibold tracking-tight">
        Connect your assistant
      </h1>
      {clientName && (
        <p>
          <strong>{clientName}</strong> requests access to read, add, change and
          delete assets in your portfolio.
        </p>
      )}
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          disabled={!clientName || busy || Boolean(error)}
          onClick={() => decide(true)}
          className="min-h-12 rounded-xl bg-foreground px-6 text-background disabled:opacity-50"
        >
          Allow access
        </button>
        <button
          disabled={busy}
          onClick={() => decide(false)}
          className="min-h-12 rounded-xl bg-surface-secondary px-6"
        >
          Cancel
        </button>
      </div>
    </main>
  );
}
