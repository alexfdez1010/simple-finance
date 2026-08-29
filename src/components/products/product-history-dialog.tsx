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
import { Modal } from '@heroui/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductHistoryChart } from '@/components/products/product-history-chart';
import {
  getProductHistoryAction,
  type ProductHistoryResult,
} from '@/lib/actions/history-actions';
import {
  buildHistoryChartData,
  HORIZON_OPTIONS,
  type HorizonYears,
} from '@/components/products/history-chart-data';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

interface Props {
  product: FinancialProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState<HorizonYears>(0);

  useEffect(() => {
    if (!open || !product) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setData(null);
      setLoadError(null);
      setHorizon(0);
      getProductHistoryAction(product.id)
        .then((result) => {
          if (cancelled) return;
          if (!result) setLoadError('History could not be loaded.');
          setData(result);
        })
        .catch(() => {
          if (!cancelled) setLoadError('History could not be loaded.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [open, product]);

  const merged = useMemo(
    () => (data ? buildHistoryChartData(data, horizon) : []),
    [data, horizon],
  );

  if (!product) return null;
  const isCustom = product.type === 'CUSTOM';
  const lastActual = data?.history[data.history.length - 1]?.value ?? 0;
  const splitDate = data?.history[data.history.length - 1]?.date;
  const canProject =
    (data?.history.length ?? 0) >= 1 && data?.expectedAnnualReturn != null;

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={open}
        onOpenChange={onOpenChange}
        variant="opaque"
      >
        <Modal.Container placement="center" scroll="inside" size="lg">
          <Modal.Dialog className="rounded-xl">
            <Modal.CloseTrigger aria-label="Close" />
            <Modal.Header className="pb-2">
              <div className="flex items-center gap-2">
                <Modal.Heading className="truncate font-serif text-xl tracking-tight">
                  {product.name}
                </Modal.Heading>
                <Badge variant="secondary">
                  {isCustom ? product.custom.currency : product.yahoo.symbol}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Daily value in your display currency.
              </p>
            </Modal.Header>
            <Modal.Body className="pt-3">
              {loading ? (
                <div aria-label="Loading product history" role="status">
                  <Skeleton className="h-[260px] w-full rounded-md" />
                </div>
              ) : loadError || !data ? (
                <p
                  className="py-12 text-center text-sm text-destructive"
                  role="alert"
                >
                  {loadError ?? 'History could not be loaded.'}
                </p>
              ) : data.history.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No snapshots yet. The first appears after the next daily run.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="text-2xl font-semibold tabular-nums">
                      {format(lastActual)}
                    </p>
                    {canProject && (
                      <div
                        className="flex gap-1"
                        aria-label="Projection horizon"
                      >
                        {HORIZON_OPTIONS.map((years) => (
                          <Button
                            key={years}
                            variant={horizon === years ? 'default' : 'ghost'}
                            size="xs"
                            aria-pressed={horizon === years}
                            onClick={() => setHorizon(years)}
                          >
                            {years === 0 ? 'Now' : `+${years}y`}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  <ProductHistoryChart data={merged} splitDate={splitDate} />
                </>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
