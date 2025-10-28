/**
 * Prisma client singleton instance
 * @module infrastructure/database/prisma-client
 */

import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma client instance to prevent multiple instances in development
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma client instance
 * Reuses the same instance in development to avoid connection exhaustion
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
