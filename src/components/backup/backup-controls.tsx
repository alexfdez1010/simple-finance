'use client';

import { useRef } from 'react';
import { DownloadSimple, UploadSimple } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useDialogFocus } from '@/components/workspace/use-dialog-focus';
import { useBackup } from './use-backup';
import { ImportBackupDialog } from './import-backup-dialog';

/**
 * Provides backup actions inside the router and currency workspace.
 * @returns File picker, download/import controls, accessible feedback and a conditional preview.
 * Selection alone never writes data; pending operations block duplicate actions.
 */
export function BackupControls() {
  const input = useRef<HTMLInputElement>(null);
  const backup = useBackup();
  const rememberTrigger = useDialogFocus(!!backup.pending);

  /** Opens the native picker while preserving its button for focus after preview dismissal. */
  function openPicker(): void {
    rememberTrigger(() => input.current?.click(), undefined);
  }
  return (
    <section aria-label="Data backup" className="space-y-3">
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button
          size="sm"
          variant="outline"
          className="min-h-11"
          disabled={!!backup.busy || !!backup.pending}
          onPress={backup.download}
          aria-busy={backup.busy === 'export'}
        >
          <DownloadSimple aria-hidden size={16} />
          {backup.busy === 'export' ? 'Exporting...' : 'Export backup'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="min-h-11"
          disabled={!!backup.busy || !!backup.pending}
          onPress={openPicker}
          aria-busy={backup.busy === 'read'}
        >
          <UploadSimple aria-hidden size={16} />
          {backup.busy === 'read' ? 'Reading...' : 'Import backup'}
        </Button>
        <input
          ref={input}
          type="file"
          accept=".json,application/json"
          aria-label="Choose backup file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) void backup.choose(file);
          }}
        />
      </div>
      {backup.error && !backup.pending && (
        <p role="alert" className="text-sm text-destructive sm:text-right">
          {backup.error}
        </p>
      )}
      {backup.message && (
        <p
          role="status"
          className="text-sm text-muted-foreground sm:text-right"
        >
          {backup.message}
        </p>
      )}
      {backup.pending && (
        <ImportBackupDialog
          backup={backup.pending}
          busy={backup.busy === 'import'}
          error={backup.error}
          onCancel={backup.cancel}
          onRestore={backup.restore}
        />
      )}
    </section>
  );
}
