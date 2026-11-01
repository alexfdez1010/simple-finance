import {
  MAX_BACKUP_BYTES,
  parseBackup,
  type FinanceBackup,
} from './backup-schema';

/**
 * Reads a bounded UTF-8 request body without database access.
 * @param request - Incoming backup POST, including optional content length.
 * @returns Validated copy; throws for absent, malformed or oversized bodies.
 * Cancels oversized streams and always releases the reader lock.
 */
export async function readBackupRequest(
  request: Request,
): Promise<FinanceBackup> {
  if (Number(request.headers.get('content-length')) > MAX_BACKUP_BYTES) {
    throw new Error('The backup exceeds the 20 MB limit.');
  }
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Choose a Simple Finance backup.');
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let text = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BACKUP_BYTES) {
        await reader.cancel();
        throw new Error('The backup exceeds the 20 MB limit.');
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  return parseBackup(text);
}
