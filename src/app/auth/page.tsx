/** Password authentication screen. @module app/auth/page */
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, FieldError, Input, Label, TextField } from '@heroui/react';
import { ArrowRight, ChartLineUp, LockSimple } from '@phosphor-icons/react';
import { AuthBrand } from '@/components/auth/auth-brand';
import { authenticateWithPassword } from '@/lib/actions/auth-actions';

/**
 * Renders the password gate and redirects to the originally requested route.
 *
 * @returns The controlled HeroUI authentication form with inline recovery states.
 * Submits only to the existing authentication action; empty inputs use native validation.
 */
export default function AuthPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || undefined;
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Authenticates a form submission and exposes recoverable inline failures.
   * @param event - Native form submission; prevented before calling the action.
   * @returns A promise settling after authentication; success redirects server-side.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authenticateWithPassword(password, redirectTo);
      if (!result.success) {
        setError(result.error || 'Authentication failed');
        setIsLoading(false);
      }
    } catch {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-dvh bg-card lg:grid-cols-2" id="main-content">
      <AuthBrand />
      <section className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[360px] animate-fade-up">
          <span className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-foreground text-background lg:hidden">
            <ChartLineUp aria-hidden size={26} />
          </span>
          <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Simple Finance
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Enter password to continue
          </p>
          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            <TextField
              isInvalid={Boolean(error)}
              isRequired
              name="password"
              type="password"
            >
              <Label className="mb-1 text-sm font-medium">Password</Label>
              <Input
                autoComplete="current-password"
                autoFocus
                disabled={isLoading}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                value={password}
                variant="secondary"
                className="min-h-12 rounded-xl px-4"
              />
              {error && <FieldError>{error}</FieldError>}
            </TextField>
            <Button
              fullWidth
              isDisabled={isLoading}
              isPending={isLoading}
              type="submit"
              variant="primary"
              className="min-h-12 gap-3 rounded-xl text-sm font-medium"
            >
              {isLoading ? 'Authenticating...' : 'Continue'}
              {!isLoading && <ArrowRight aria-hidden size={17} />}
            </Button>
          </form>
          <p className="mt-8 flex items-center gap-2 text-xs leading-5 text-muted-foreground">
            <LockSimple aria-hidden size={14} />
            Password-protected access to your portfolio.
          </p>
        </div>
      </section>
    </main>
  );
}
