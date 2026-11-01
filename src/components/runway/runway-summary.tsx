'use client';

import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import { computeSafeRunwayProjection } from '@/lib/domain/services/safe-runway-projection';
import type {
  RunwayHolding,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';
import { formatRunwayMonths } from './runway-format';

/** Summarizes the saved monthly plan with the same calculation as the dedicated simulator. */
export function RunwaySummary({
  products,
  settings,
}: {
  products: RunwayHolding[];
  settings: RunwaySettings | null;
}) {
  const { format } = useDisplayCurrency();
  const calculation = settings
    ? computeSafeRunwayProjection(products, settings)
    : null;
  const p = calculation?.projection;
  return (
    <section aria-label="Financial runway" className="finance-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold">
          Monthly living cost & FIRE
        </h2>
        <Link
          href="/dashboard/runway"
          prefetch={false}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
        >
          Runway & FIRE <ArrowUpRight aria-hidden size={16} />
        </Link>
      </div>
      {p && settings ? (
        <dl className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">
              Living cost / month
            </dt>
            <dd className="display-number mt-2 text-2xl font-semibold">
              {format(settings.monthlyExpenses)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Estimated runway</dt>
            <dd className="mt-2 text-2xl font-semibold">
              {formatRunwayMonths(p.runwayMonths)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">FIRE estimate</dt>
            <dd
              className={`mt-2 text-2xl font-semibold ${p.fireReached ? 'text-gain' : ''}`}
            >
              {p.fireReached ? 'FIRE' : `${(p.fireProgress * 100).toFixed(1)}%`}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              Invest / month for FIRE in {settings.targetYears} years
            </dt>
            <dd className="display-number mt-2 text-2xl font-semibold text-primary">
              {format(p.requiredMonthlyContribution)}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">
          {calculation?.error ??
            'Set your monthly living cost and inflation to see how long your portfolio can cover them'}
        </p>
      )}
    </section>
  );
}
