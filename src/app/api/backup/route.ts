import { revalidatePath } from 'next/cache';
import { isAuthenticated } from '@/lib/auth/auth-utils';
import { displayCurrencySchema } from '@/lib/backup/backup-schema';
import { readBackupRequest } from '@/lib/backup/read-backup-request';
import {
  exportBackup,
  restoreBackup,
} from '@/lib/infrastructure/database/backup-repository';

export const runtime = 'nodejs';
const privateHeaders = { 'Cache-Control': 'no-store' };

/**
 * Downloads all persisted data for an authenticated owner without changing records.
 * @param request - GET with an optional supported currency query parameter.
 * @returns An uncached JSON attachment, or a 400/401/500 JSON error.
 */
export async function GET(request: Request): Promise<Response> {
  if (!(await isAuthenticated())) {
    return Response.json(
      { error: 'Sign in to export your data.' },
      { status: 401, headers: privateHeaders },
    );
  }
  const currency = displayCurrencySchema.safeParse(
    new URL(request.url).searchParams.get('currency') ?? 'EUR',
  );
  if (!currency.success)
    return Response.json(
      { error: 'Unsupported display currency.' },
      { status: 400, headers: privateHeaders },
    );
  try {
    const backup = await exportBackup(currency.data);
    return new Response(JSON.stringify(backup), {
      headers: {
        ...privateHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="simple-finance-${backup.exportedAt.slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup export failed', error);
    return Response.json(
      { error: 'Could not export your data. Try again.' },
      { status: 500, headers: privateHeaders },
    );
  }
}

/**
 * Performs an authenticated replacement after validating the whole copy and origin.
 * @param request - Same-origin POST containing the exported JSON document.
 * @returns Restored preferences on success, or a 400/401/403/500 JSON error.
 * Replaces all stored app records atomically, then invalidates dashboard caches.
 */
export async function POST(request: Request): Promise<Response> {
  if (!(await isAuthenticated())) {
    return Response.json(
      { error: 'Sign in to import your data.' },
      { status: 401, headers: privateHeaders },
    );
  }
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    return Response.json(
      { error: 'Import must be started from this app.' },
      { status: 403, headers: privateHeaders },
    );
  }
  let backup;
  try {
    backup = await readBackupRequest(request);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Invalid backup.' },
      { status: 400, headers: privateHeaders },
    );
  }
  try {
    await restoreBackup(backup);
  } catch (error) {
    console.error('Backup restore failed', error);
    return Response.json(
      {
        error:
          'Could not restore the backup. Your existing data has been kept.',
      },
      { status: 500, headers: privateHeaders },
    );
  }
  revalidatePath('/dashboard', 'layout');
  return Response.json(
    { success: true, preferences: backup.preferences },
    { headers: privateHeaders },
  );
}
