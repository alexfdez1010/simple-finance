'use client';

/** Displays newly issued single-use codes without storing them in browser storage or sending them elsewhere. */
export function RecoveryCodes({
  codes,
  onDone,
}: {
  codes: string[];
  onDone: () => void;
}) {
  return (
    <section aria-label="Recovery codes" className="space-y-5">
      <h2 className="text-lg font-semibold">Save your recovery codes</h2>
      <p className="text-sm text-muted-foreground">
        Each code can be used once if you lose access to your authenticator app.
        New codes replace the previous set.
      </p>
      <ul className="grid max-w-md grid-cols-2 gap-3 rounded-xl bg-surface-secondary p-4 font-mono text-sm">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <a
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(['Simple Finance recovery codes', ...codes].join('\n'))}`}
          download="simple-finance-recovery-codes.txt"
          className="inline-flex min-h-12 items-center rounded-xl bg-foreground px-5 text-sm text-background"
        >
          Download recovery codes
        </a>
        <button
          onClick={onDone}
          className="min-h-12 rounded-xl bg-surface-secondary px-5 text-sm"
        >
          I saved these codes
        </button>
      </div>
    </section>
  );
}
