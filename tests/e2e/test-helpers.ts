/**
 * Test helper utilities for E2E tests
 * @module tests/e2e/test-helpers
 */

import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

/**
 * Clean all products from the database
 * Use this in beforeEach hooks to ensure test isolation
 */
export async function cleanDatabase(): Promise<void> {
  await prisma.financialProduct.deleteMany({});
}

/**
 * Disconnect Prisma client
 * Use this in afterAll hooks
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
