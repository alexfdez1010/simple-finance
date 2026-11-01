'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from '@phosphor-icons/react';
import { AuthBrand } from './auth-brand';
import { authClient } from '@/lib/auth/client';
import { safeRedirect } from '@/lib/auth/redirect';

/** Renders the owner form; keeps credentials on failures and resumes signed OAuth requests. */
export function AuthForm({ canRegister }: { canRegister: boolean }) {
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  /** Submits credentials to Better Auth; signed OAuth responses take precedence over app navigation. */
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const fields = new FormData(event.currentTarget);
    const credentials = {
      email: String(fields.get('email')),
      password: String(fields.get('password')),
    };
    try {
      const result = canRegister
        ? await authClient.signUp.email({
            ...credentials,
            name: String(fields.get('name')),
          })
        : await authClient.signIn.email(credentials);
      if (result.error) {
        setError(
          canRegister
            ? 'Could not create the account. Registration may already be closed.'
            : 'Invalid email or password',
        );
        setBusy(false);
        return;
      }
      const data = result.data as { redirect?: boolean; url?: string } | null;
      if (data?.redirect && data.url) {
        return;
      }
      window.location.assign(safeRedirect(searchParams.get('redirectTo')));
    } catch {
      setError('Could not connect. Try again.');
      setBusy(false);
    }
  }

  const inputClass =
    'min-h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60';
  return (
    <main className="grid min-h-dvh bg-card lg:grid-cols-2" id="main-content">
      <AuthBrand />
      <section className="flex min-h-dvh items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[360px] animate-fade-up">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple Finance
          </h1>
          <h2 className="mt-3 text-lg">
            {canRegister ? 'Create your account' : 'Sign in'}
          </h2>
          {canRegister && (
            <p className="mt-2 text-sm text-muted-foreground">
              Registration closes after this account is created.
            </p>
          )}
          <form className="mt-8 space-y-5" onSubmit={submit}>
            {canRegister && (
              <label className="grid gap-2 text-sm font-medium">
                Name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  className={inputClass}
                  disabled={busy}
                />
              </label>
            )}
            <label className="grid gap-2 text-sm font-medium">
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
                disabled={busy}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Password
              <input
                name="password"
                type="password"
                autoComplete={canRegister ? 'new-password' : 'current-password'}
                required
                minLength={canRegister ? 12 : undefined}
                maxLength={128}
                className={inputClass}
                disabled={busy}
                aria-describedby={canRegister ? 'password-help' : undefined}
              />
            </label>
            {canRegister && (
              <p id="password-help" className="text-xs text-muted-foreground">
                At least 12 characters
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-foreground px-4 text-sm font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-60"
            >
              {busy
                ? 'Please wait…'
                : canRegister
                  ? 'Create account'
                  : 'Sign in'}
              {!busy && <ArrowRight aria-hidden size={17} />}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
