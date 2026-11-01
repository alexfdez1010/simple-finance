'use client';

import { Fire } from '@phosphor-icons/react';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import type { RunwayProjection } from '@/lib/domain/models/runway.types';
import { formatRunwayMonths } from './runway-format';

/** Shows FIRE funding and time as outcomes of living costs, real return, and monthly investment. */
export function FireResults({
  projection: p,
}: {
  projection: RunwayProjection;
}) {
  const { format } = useDisplayCurrency();
  const duration =
    p.projectedFireMonth === 0
      ? 'Reached'
      : p.projectedFireMonth == null
        ? 'Not reached within 50 years'
        : formatRunwayMonths(p.projectedFireMonth);
  return (
    <section aria-label="FIRE estimate" className="finance-card p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Financial independence</h3>
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${p.fireReached ? 'bg-gain/10 text-gain' : 'bg-primary/10 text-primary'}`}
        >
          <Fire aria-hidden size={17} />
          {p.fireReached
            ? 'FIRE'
            : `${(p.fireProgress * 100).toFixed(1)}% of FIRE`}
        </span>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">
        Estimated time to FIRE
      </p>
      <p
        className="display-number mt-2 text-3xl font-semibold"
        data-testid="fire-time"
      >
        {duration}
      </p>
      <progress
        aria-label="FIRE target progress"
        className="mt-5 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-default [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
        max={1}
        value={p.fireProgress}
      />
      <dl className="mt-3 flex flex-wrap justify-between gap-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Current capital</dt>
          <dd className="mt-1 font-medium">{format(p.initialCapital)}</dd>
        </div>
        <div className="text-right">
          <dt className="text-muted-foreground">FIRE target</dt>
          <dd className="mt-1 font-medium">
            {p.fireTarget == null ? 'Unavailable' : format(p.fireTarget)}
          </dd>
        </div>
      </dl>
      <dl className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">
            Return after inflation / month
          </dt>
          <dd className="display-number mt-2 text-2xl font-semibold">
            {format(p.monthlyFireIncome)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Monthly cost gap</dt>
          <dd className="display-number mt-2 text-2xl font-semibold text-primary">
            {format(p.monthlyIncomeGap)}
          </dd>
        </div>
      </dl>
      {p.fireTarget == null && (
        <p className="mt-5 text-xs text-muted-foreground">
          Return does not exceed inflation
        </p>
      )}
    </section>
  );
}
