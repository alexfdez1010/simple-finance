'use client';

import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import type {
  RunwayProjection,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';
import { formatRunwayMonths } from './runway-format';

/** Displays first-month consumption and depletion time without including new monthly investments. */
export function RunwayResults({
  projection: p,
  settings: s,
}: {
  projection: RunwayProjection;
  settings: RunwaySettings;
}) {
  const { format } = useDisplayCurrency();
  const figures = [
    ['Portfolio return / month', format(p.firstMonthReturn)],
    [
      p.netMonthlyBurn >= 0 ? 'Net draw / month' : 'Surplus / month',
      format(Math.abs(p.netMonthlyBurn)),
    ],
  ];
  return (
    <section
      aria-label="Monthly cost coverage"
      className="balance-surface flex flex-col justify-between rounded-2xl p-6 sm:p-8"
    >
      <div>
        <p className="text-sm text-white/75">Estimated runway</p>
        <p
          className="display-number mt-2 text-3xl font-semibold sm:text-4xl"
          data-testid="runway-duration"
        >
          {formatRunwayMonths(p.runwayMonths)}
        </p>
        <p className="mt-5 text-sm text-white/75">Monthly living cost</p>
        <p className="display-number mt-1 text-2xl font-medium">
          {format(s.monthlyExpenses)}
        </p>
      </div>
      <dl className="mt-8 grid gap-5 sm:grid-cols-2">
        {figures.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-white/75">{label}</dt>
            <dd className="display-number mt-1.5 text-xl font-medium">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
