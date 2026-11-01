'use client';
import { useState } from 'react';
import QRCode from 'react-qr-code';
import { CopyButton } from '@/components/ui/copy-button';

/** Renders the secret QR locally, a manual key and a possession check before activation. */
export function AuthenticatorEnrollment({
  uri,
  busy,
  onVerify,
  onCancel,
}: {
  uri: string;
  busy: boolean;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState('');
  const secret = new URL(uri).searchParams.get('secret') || '';
  /** Submits exactly the six-digit authenticator code, never the shared secret. */
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onVerify(code);
  }
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Scan this QR code with your authenticator app, then enter its six-digit
        code.
      </p>
      <div className="w-fit rounded-xl bg-white p-4">
        <QRCode value={uri} size={192} title="Authenticator setup QR code" />
      </div>
      <details className="text-sm">
        <summary className="min-h-11 cursor-pointer">
          Enter setup key manually
        </summary>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <code className="break-all">{secret}</code>
          <CopyButton value={secret} label="Copy setup key" />
        </div>
      </details>
      <form onSubmit={submit} className="space-y-4">
        <label className="grid max-w-xs gap-2 text-sm font-medium">
          Authentication code
          <input
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            disabled={busy}
            className="min-h-12 rounded-xl border border-input bg-background px-4 font-mono outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            disabled={busy}
            className="min-h-12 rounded-xl bg-foreground px-5 text-sm text-background disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Activate 2FA'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="min-h-12 rounded-xl bg-surface-secondary px-5 text-sm"
          >
            Cancel setup
          </button>
        </div>
      </form>
    </div>
  );
}
