/** Public, non-personal fallback cached by the worker; retry performs a full navigation to restore connectivity. */
export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh items-center justify-center p-6"
    >
      <div className="w-full max-w-sm space-y-5">
        <p className="text-sm font-medium text-muted-foreground">
          Simple Finance
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          You’re offline
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Connect to the internet to view your portfolio and save changes.
        </p>
        <a
          href="/dashboard"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-foreground px-5 text-sm text-background"
        >
          Try again
        </a>
      </div>
    </main>
  );
}
