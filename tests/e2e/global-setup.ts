import { request } from '@playwright/test';
import { PrismaClient } from './database-client';
import { testCredentials } from './auth-helper';

/** Cleans local financial fixtures and creates the sole test owner through Better Auth when needed. */
export default async function globalSetup() {
  const prisma = new PrismaClient();
  try {
    await prisma.rateLimit.deleteMany();
    await prisma.runwaySettings.deleteMany();
    await prisma.financialProduct.deleteMany();
    await prisma.portfolioSnapshot.deleteMany();
    const ctx = await request.newContext();
    if (!(await prisma.user.count())) {
      const result = await ctx.post(
        'http://localhost:3000/api/auth/sign-up/email',
        {
          data: { ...testCredentials, name: 'Test Owner' },
          headers: { origin: 'http://localhost:3000' },
        },
      );
      if (!result.ok()) throw new Error(await result.text());
    }
    await ctx.dispose();
  } finally {
    await prisma.$disconnect();
  }
}
