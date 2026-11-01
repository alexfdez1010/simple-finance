/**
 * Serializes rows into bounded JSON arguments below D1's per-value limit.
 * @param records - Validated financial records in insertion order.
 * @returns JSON chunks with all records preserved; throws before mutation if one row is too large.
 */
export function backupChunks(records: readonly object[]): string[] {
  const chunks: string[] = [];
  let rows: string[] = [];
  let size = 2;
  const encoder = new TextEncoder();
  for (const record of records) {
    const row = JSON.stringify(record);
    const bytes = encoder.encode(row).length + 1;
    if (bytes > 1_000_000)
      throw new Error('A backup record exceeds the D1 import limit');
    if (size + bytes > 1_000_000 && rows.length) {
      chunks.push(`[${rows.join(',')}]`);
      rows = [];
      size = 2;
    }
    rows.push(row);
    size += bytes;
  }
  if (rows.length) chunks.push(`[${rows.join(',')}]`);
  return chunks;
}
