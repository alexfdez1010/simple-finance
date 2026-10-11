'use client';
import { Button } from '@/components/ui/button';

/**
 * Preserves navigation when a workspace read fails and offers local retry.
 * @param props - Next.js reset callback; error details remain server-side.
 * @returns Accessible recovery state; retry re-renders this workspace.
 */
export default function WorkspaceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section role="alert" className="finance-card p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">This workspace couldn’t load</h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
        A portfolio or market-data request failed. Retry this view or choose
        another section from the navigation.
      </p>
      <Button onPress={reset} className="mt-5 min-h-11">
        Try again
      </Button>
    </section>
  );
}
