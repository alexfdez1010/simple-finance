'use client';

import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import type {
  RunwayProjection,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';

/** Keeps calculation details available without adding prose to the main results. */
export function RunwayAssumptions({
  projection: p,
  settings: s,
}: {
  projection: RunwayProjection;
  settings: RunwaySettings;
}) {
  const { format } = useDisplayCurrency();
  return (
    <details className="px-1 text-xs text-muted-foreground">
      <summary className="min-h-8 cursor-pointer font-medium">
        Calculation assumptions
      </summary>
      <div className="mt-2 space-y-2 leading-relaxed">
        <p>
          Annual portfolio return: {(p.annualReturn * 100).toFixed(2)}%,
          weighted across current holdings. Annual inflation:{' '}
          {(s.annualInflation * 100).toFixed(2)}%.
        </p>
        <p>
          Runway compounds remaining capital and deducts inflation-adjusted
          living costs, without new investments. Monthly figures show the first
          month.
        </p>
        <p>
          FIRE requires estimated returns after inflation to cover living costs.
          Its separate projection adds your monthly investment after living
          costs.
        </p>
        <p>
          The model includes illiquid assets and excludes taxes, fees and market
          volatility. FIRE is an estimate, not guaranteed income.
        </p>
        {p.unknownReturnCapital > 0 && (
          <p>
            {format(p.unknownReturnCapital)} has no available return estimate
            and is modelled at 0%.
          </p>
        )}
      </div>
    </details>
  );
}
