import { describe, expect, it } from 'vitest';
import { backupChunks } from '@/lib/infrastructure/database/backup-chunks';

describe('bounded D1 backup arguments', () => {
  it('preserves Unicode and all records across chunks below the byte limit', () => {
    const records = Array.from({ length: 20 }, (_, id) => ({
      id,
      note: 'ñ'.repeat(40_000),
    }));
    const chunks = backupChunks(records);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.flatMap((chunk) => JSON.parse(chunk))).toEqual(records);
    expect(
      chunks.every(
        (chunk) => new TextEncoder().encode(chunk).length <= 1_000_000,
      ),
    ).toBe(true);
  });
  it('has no statements for empty collections and rejects oversized individual records', () => {
    expect(backupChunks([])).toEqual([]);
    expect(() => backupChunks([{ note: 'a'.repeat(1_000_001) }])).toThrow(
      'D1 import limit',
    );
  });
});
