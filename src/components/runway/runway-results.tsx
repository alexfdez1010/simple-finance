'use client';

import { Fire } from '@phosphor-icons/react';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import type {
  RunwayProjection,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';
import { formatRunwayMonths } from './runway-format';

/** Displays monthly coverage before runway and the separate withdrawal-based FIRE estimate. */
export function RunwayResults({
  projection: p,
  settings: s,
}: {
  projection: RunwayProjection;
  settings: RunwaySettings;
}) {
  const { format } = useDisplayCurrency();
  const monthlyWithdrawal = (p.initialCapital * s.withdrawalRate) / 12;
  const figures = [
    ['Portfolio return / month', format(p.firstMonthReturn)],
    ['Other income / month', format(s.monthlyIncome)],
    [
      p.netMonthlyBurn >= 0 ? 'Net draw / month' : 'Surplus / month',
      format(Math.abs(p.netMonthlyBurn)),
    ],
  ];
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-2">
      <section
        aria-label="Monthly cost coverage"
        className="balance-surface flex flex-col justify-between rounded-2xl p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h2 className="text-sm text-white/75">Monthly living cost</h2>
            <p className="display-number mt-2 text-4xl font-semibold 2xl:text-5xl">
              {format(s.monthlyExpenses)}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-white/75">Estimated runway</p>
            <p
              className="mt-2 text-2xl font-semibold"
              data-testid="runway-duration"
            >
              {formatRunwayMonths(p.runwayMonths)}
            </p>
          </div>
        </div>
        <dl className="mt-8 grid gap-5 sm:grid-cols-3">
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
      <section aria-label="FIRE estimate" className="finance-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Financial independence</h2>
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${p.fireReached ? 'bg-gain/10 text-gain' : 'bg-primary/10 text-primary'}`}
          >
            <Fire aria-hidden size={17} />
            {p.fireReached
              ? 'FIRE'
              : `${Math.min(p.fireProgress * 100, 100).toFixed(1)}% of FIRE`}
          </span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Monthly withdrawal at {(s.withdrawalRate * 100).toFixed(1)}% / year
        </p>
        <p className="display-number mt-1 text-3xl font-semibold">
          {format(monthlyWithdrawal)}{' '}
          <span className="text-sm font-normal text-muted-foreground">
            / month
          </span>
        </p>
        <progress
          aria-label="FIRE target progress"
          className="mt-5 h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-default [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
          max={1}
          value={Math.min(p.fireProgress, 1)}
        />
        <dl className="mt-3 flex flex-wrap justify-between gap-3 text-xs">
          <div>
            <dt className="text-muted-foreground">Current capital</dt>
            <dd className="mt-1 font-medium">{format(p.initialCapital)}</dd>
          </div>
          <div className="text-right">
            <dt className="text-muted-foreground">FIRE target today</dt>
            <dd className="mt-1 font-medium">{format(p.fireTarget)}</dd>
          </div>
        </dl>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="text-sm text-muted-foreground">
              Invest / month for FIRE in {s.targetYears} years
            </h3>
            <p
              className="display-number mt-2 text-2xl font-semibold text-primary"
              data-testid="fire-monthly-required"
            >
              {format(p.requiredMonthlyContribution)}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">
              Wealth in {s.targetYears} years
            </h3>
            <p className="display-number mt-2 text-2xl font-semibold">
              {format(p.projectedWealth)}
            </p>
            <p className="mt-2 text-xs font-medium text-primary">
              {p.projectedFireMonth === 0
                ? 'FIRE target already reached'
                : p.projectedFireMonth == null
                  ? 'FIRE target not reached within 50 years'
                  : `FIRE projection: ${formatRunwayMonths(p.projectedFireMonth)}`}
            </p>
          </div>
        </div>
      </section>
      <details className="px-1 text-xs text-muted-foreground xl:col-span-2">
        <summary className="min-h-8 cursor-pointer font-medium">
          Calculation assumptions
        </summary>
        <div className="mt-2 space-y-2 leading-relaxed">
          <p>
            Annual portfolio return: {(p.annualReturn * 100).toFixed(2)}%{' '}
            {s.annualReturnOverride == null
              ? 'weighted across current holdings'
              : 'from your override'}
            . Annual inflation: {(s.annualInflation * 100).toFixed(2)}%. Planned
            investment: {format(s.monthlyContribution)} / month.
          </p>
          <p>
            Monthly figures show the first month. Runway then inflates living
            costs and compounds the remaining capital. Other income stays fixed;
            accrued gains are counted once.
          </p>
          <p>
            FIRE divides annual living costs by the withdrawal rate, excluding
            salary. The target rises with inflation. Wealth adds only your
            planned investment after living costs.
          </p>
          <p>
            The model uses your total portfolio, including illiquid assets.
            Returns are estimates, with no taxes, fees or market volatility.
            FIRE is a scenario, not guaranteed income.
          </p>
          {p.unknownReturnCapital > 0 && s.annualReturnOverride == null && (
            <p>
              {format(p.unknownReturnCapital)} has no available return estimate
              and is modelled at 0%.
            </p>
          )}
        </div>
      </details>
    </div>
  );
}
