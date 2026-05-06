/**
 * Product history dialog with daily-EUR chart and (custom-only) future
 * simulation. The series is loaded on demand from `getProductHistoryAction`;
 * values are stored in EUR and converted at render time via the dashboard's
 * display-currency selector so this dialog matches whatever the user picked
 * up top.
 *
 * @module components/products/product-history-dialog
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ProductHistoryChart,
  type HistoryChartPoint,
} from '@/components/products/product-history-chart';
import {
  getProductHistoryAction,
  type ProductHistoryResult,
} from '@/lib/actions/history-actions';
import { simulateCustomFuture } from '@/lib/domain/services/simulate-custom-future';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

interface Props {
  product: FinancialProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HORIZON_OPTIONS = [0, 1, 5, 10] as const;
type HorizonYears = (typeof HORIZON_OPTIONS)[number];

/**
 * Builds the merged actual + projected series for the chart. The last
 * actual point is duplicated into `projected` so the dashed line picks up
 * exactly where the solid line ends, with no visual gap.
 */
function buildChartData(
  data: ProductHistoryResult,
  horizon: HorizonYears,
): HistoryChartPoint[] {
  const actual: HistoryChartPoint[] = data.history.map((p) => ({
    date: p.date,
    actual: p.value,
    projected: null,
  }));
  if (!data.custom || horizon === 0) return actual;
  const lastActual = actual[actual.length - 1];
  if (!lastActual) return actual;
  const sim = simulateCustomFuture(
    data.custom.contributions.map((c) => ({
      id: '',
      amount: c.amount,
      date: new Date(c.date),
      note: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    data.custom.annualReturnRate,
    data.custom.anchorEurPerProductCcy,
    horizon,
    new Date(lastActual.date),
  );
  lastActual.projected = lastActual.actual;
  const tail = sim.slice(1).map((s) => ({
    date: s.date,
    actual: null,
    projected: s.value,
  }));
  return [...actual, ...tail];
}

/**
 * History + simulation dialog.
 *
 * @param props - product (non-null when open), open, onOpenChange
 * @returns Dialog element
 */
export function ProductHistoryDialog({ product, open, onOpenChange }: Props) {
  const { format } = useDisplayCurrency();
  const [data, setData] = useState<ProductHistoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [horizon, setHorizon] = useState<HorizonYears>(0);

  useEffect(() => {
    if (!open || !product) return;
    let cancelled = false;
    setLoading(true);
    setData(null);
    setHorizon(0);
    getProductHistoryAction(product.id).then((res) => {
      if (cancelled) return;
      setData(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, product]);

  const merged = useMemo(
    () => (data ? buildChartData(data, horizon) : []),
    [data, horizon],
  );

  if (!product) return null;
  const isCustom = product.type === 'CUSTOM';
  const lastActual = data?.history[data.history.length - 1]?.value ?? 0;
  const splitDate = data?.history[data.history.length - 1]?.date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="font-serif text-xl">
              {product.name}
            </DialogTitle>
            <Badge variant="secondary">
              {isCustom ? product.custom.currency : product.yahoo.symbol}
            </Badge>
          </div>
          <DialogDescription>
            Daily value stored in EUR; rendered in your selected display
            currency.
          </DialogDescription>
        </DialogHeader>

        {loading || !data ? (
          <Skeleton className="h-[260px] w-full" />
        ) : data.history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            No snapshots yet. The first one is written by tomorrow&apos;s daily
            cron.
          </p>
        ) : (
          <>
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <p className="text-2xl font-bold tabular-nums">
                {format(lastActual)}
              </p>
              {isCustom && (
                <div className="flex gap-1">
                  {HORIZON_OPTIONS.map((h) => (
                    <Button
                      key={h}
                      variant={horizon === h ? 'default' : 'ghost'}
                      size="xs"
                      onClick={() => setHorizon(h)}
                    >
                      {h === 0 ? 'Now' : `+${h}y`}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <ProductHistoryChart data={merged} splitDate={splitDate} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
