'use client';

import { AlertDialog } from '@heroui/react';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/products/form-actions';
import type { FinanceBackup } from '@/lib/backup/backup-schema';

/**
 * Presents a selected copy and its replacement consequences.
 * @param props - Validated copy, pending/error state and cancel/restore callbacks.
 * @returns A focus-trapped confirmation with initial focus on Cancel.
 * Only explicit confirmation invokes restore; all dismissal is blocked while it is pending.
 */
export function ImportBackupDialog({
  backup,
  busy,
  error,
  onCancel,
  onRestore,
}: {
  backup: FinanceBackup;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onRestore: () => Promise<void>;
}) {
  const { data } = backup;
  return (
    <AlertDialog>
      <AlertDialog.Backdrop
        className="finance-dialog-backdrop"
        isOpen
        onOpenChange={(open) => {
          if (!open) onCancel();
        }}
        variant="opaque"
      >
        <AlertDialog.Container
          className="finance-dialog-motion"
          placement="center"
          size="sm"
        >
          <AlertDialog.Dialog className="rounded-xl">
            <AlertDialog.Header>
              <AlertDialog.Heading>Restore backup</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="space-y-4 text-sm">
              <p>
                Copy saved on{' '}
                {new Date(backup.exportedAt).toLocaleString('en-GB')}
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                <dt>Holdings</dt>
                <dd className="text-right tabular-nums">
                  {data.products.length}
                </dd>
                <dt>Movements</dt>
                <dd className="text-right tabular-nums">
                  {data.contributions.length}
                </dd>
                <dt>Product snapshots</dt>
                <dd className="text-right tabular-nums">
                  {data.productSnapshots.length}
                </dd>
                <dt>Portfolio snapshots</dt>
                <dd className="text-right tabular-nums">
                  {data.portfolioSnapshots.length}
                </dd>
                <dt>Simulation settings</dt>
                <dd className="text-right tabular-nums">
                  {data.runwaySettings.length}
                </dd>
                <dt>Display currency</dt>
                <dd className="text-right">
                  {backup.preferences.displayCurrency}
                </dd>
              </dl>
              <p className="text-muted-foreground">
                This replaces all current holdings, movements, history and
                simulation settings, including with empty data. Export a backup
                first if you want to keep them.
              </p>
              {error && (
                <p role="alert" className="text-destructive">
                  {error}
                </p>
              )}
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                variant="ghost"
                disabled={busy}
                onPress={onCancel}
                autoFocus
              >
                Cancel
              </Button>
              <LoadingButton
                variant="destructive"
                loading={busy}
                loadingText="Restoring..."
                onPress={onRestore}
              >
                Replace all data
              </LoadingButton>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
