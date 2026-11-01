import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '../../../../generated/cloudflare/client';
import { getDatabase } from '@/lib/cloudflare/context';

/** Builds a request-bound client; D1 bindings cannot be shared across requests. */
function createClient(): PrismaClient {
  return new PrismaClient({ adapter: new PrismaD1(getDatabase()) });
}

/** Lazily resolves D1 for existing repositories without doing I/O during module evaluation. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = createClient();
    const value = Reflect.get(client, property);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
