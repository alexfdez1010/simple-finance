'use client';

import { Button } from '@heroui/react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Renders a recoverable application error boundary.
 *
 * @param props - Captured error and the Next.js retry callback.
 * @returns A concise error state with one recovery action.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main
      className="app-shell flex min-h-[70dvh] items-center justify-center px-5"
      id="main-content"
    >
      <section className="max-w-sm text-center" role="alert">
        <p className="eyebrow mb-3">Error</p>
        <h1 className="font-serif text-3xl tracking-tight">
          We couldn&apos;t load this view
        </h1>
        <p className="mt-3 text-sm text-muted">
          {error.digest ? `Reference ${error.digest}` : 'Please try again.'}
        </p>
        <Button className="mt-6" onPress={reset} variant="primary">
          Try again
        </Button>
      </section>
    </main>
  );
}
