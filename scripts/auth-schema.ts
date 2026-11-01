import { PrismaClient } from '../generated/prisma';
import { PrismaD1 } from '@prisma/adapter-d1';
import type { D1Database } from '@cloudflare/workers-types';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { getAuth } from '../src/lib/auth/config';

// Schema generation reads metadata only; this adapter performs no database I/O.
export const auth = getAuth(
  prismaAdapter(new PrismaClient({ adapter: new PrismaD1({} as D1Database) }), {
    provider: 'sqlite',
  }),
);
