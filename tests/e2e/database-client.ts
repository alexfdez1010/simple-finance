import { PrismaD1 } from '@prisma/adapter-d1';
import type { D1Database } from '@cloudflare/workers-types';
import { PrismaClient as BaseClient } from '../../generated/prisma';

const endpoint = 'http://localhost:3000/cdn-cgi/local/explorer/api/d1/database';
type RawResult = {
  success: boolean;
  results: { columns: string[]; rows: unknown[][] };
  meta: { changes: number };
};
let databaseId: Promise<string> | undefined;

/** Resolves only Wrangler's localhost DB binding; no production token or remote adapter exists here. */
async function localDatabaseId(): Promise<string> {
  databaseId ??= fetch(endpoint).then(async (response) => {
    const body = await response.json();
    const database = body.result?.find(
      (entry: { name: string }) => entry.name === 'DB',
    );
    if (!database)
      throw new Error('Start the Worker preview before running E2E tests');
    return database.uuid as string;
  });
  return databaseId;
}

/** Executes fixture SQL through the running local emulator, avoiding competing SQLite runtimes. */
async function query(sql: string, params: unknown[]): Promise<RawResult> {
  let parameter = 0;
  const localSql = sql.replace(/\?/g, () =>
    params[parameter++] == null ? 'NULL' : '?',
  );
  const localParams = params.filter((value) => value != null).map(String);
  const response = await fetch(`${endpoint}/${await localDatabaseId()}/raw`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sql: localSql, params: localParams }),
  });
  const body = await response.json();
  if (!response.ok || !body.success)
    throw new Error(
      `Local D1 fixture query failed: ${JSON.stringify(body.errors)}`,
    );
  return body.result[0];
}

/** Implements the two statement methods used by Prisma's D1 adapter against localhost only. */
function statement(sql: string, params: unknown[] = []) {
  return {
    bind: (...values: unknown[]) => statement(sql, values),
    run: () => query(sql, params),
    raw: async () => {
      const result = await query(sql, params);
      return [result.results.columns, ...result.results.rows];
    },
  };
}

/** Uses the actual local Worker's D1 connection for fixtures, without a native SQLite addon. */
export class PrismaClient extends BaseClient {
  constructor() {
    super({
      adapter: new PrismaD1({ prepare: statement } as unknown as D1Database),
    });
  }
}
