/** Password authentication screen. @module app/auth/page */
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  TextField,
} from '@heroui/react';
import { authenticateWithPassword } from '@/lib/actions/auth-actions';

/**
 * Renders the password gate and redirects to the originally requested route.
 *
 * @returns The controlled HeroUI authentication form.
 */
export default function AuthPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || undefined;
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /** Authenticates the submitted password and exposes inline failure state. */
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
    <main
      className="app-shell flex items-center justify-center px-5 py-16"
      id="main-content"
    >
      <Card className="w-full max-w-sm rounded-xl border border-border bg-surface p-0 shadow-none">
        <Card.Header className="gap-2 border-b border-border px-7 py-6">
          <p className="font-mono text-[0.65rem] font-semibold tracking-[0.14em] text-muted uppercase">
            Private portfolio
          </p>
          <Card.Title className="font-serif text-3xl font-normal tracking-tight">
            Simple Finance
          </Card.Title>
          <Card.Description>Enter password to continue</Card.Description>
        </Card.Header>
        <Card.Content className="px-7 py-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <TextField
              isInvalid={Boolean(error)}
              isRequired
              name="password"
              type="password"
            >
              <Label>Password</Label>
              <Input
                autoComplete="current-password"
                autoFocus
                disabled={isLoading}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                value={password}
                variant="secondary"
              />
              {error && <FieldError>{error}</FieldError>}
            </TextField>
            <Button
              fullWidth
              isDisabled={isLoading}
              isPending={isLoading}
              type="submit"
              variant="primary"
            >
              {isLoading ? 'Authenticating...' : 'Continue'}
            </Button>
          </form>
        </Card.Content>
      </Card>
    </main>
  );
}
