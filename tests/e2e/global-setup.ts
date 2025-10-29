/**
 * Global setup for E2E tests
 * Cleans the database before running tests
 * @module tests/e2e/global-setup
 */

import { PrismaClient } from '../../generated/prisma';

/**
 * Global setup function
 * Cleans all products from the database before tests run
 */
async function globalSetup() {
  const prisma = new PrismaClient();

  try {
    // Clean up all products before running tests
    await prisma.financialProduct.deleteMany({});
    console.log('✓ Database cleaned successfully');
  } catch (error) {
    console.error('Failed to clean database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
