import Link from 'next/link';

/** Renders the compact missing-route state with a path back to the dashboard. */
export default function NotFoundPage() {
  return (
    <main
      className="app-shell flex min-h-[70dvh] items-center justify-center px-5"
      id="main-content"
    >
      <section className="max-w-sm text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="font-serif text-3xl tracking-tight">Page not found</h1>
        <Link
          className="mt-6 inline-flex min-h-10 items-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-transform active:scale-[0.98]"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
