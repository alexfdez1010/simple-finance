/**
 * Repository for portfolio data access
 * @module infrastructure/database/portfolio-repository
 */

import { prisma } from './prisma-client';
import type { Portfolio } from '@/lib/domain/models/product.types';

/**
 * Creates a new portfolio
 *
 * @param name - Portfolio name
 * @returns Created portfolio
 */
export async function createPortfolio(name: string): Promise<Portfolio> {
  return await prisma.portfolio.create({
    data: { name },
  });
}

/**
 * Finds a portfolio by ID
 *
 * @param portfolioId - Portfolio ID
 * @returns Portfolio or null if not found
 */
export async function findPortfolioById(
  portfolioId: string,
): Promise<Portfolio | null> {
  return await prisma.portfolio.findUnique({
    where: { id: portfolioId },
  });
}

/**
 * Finds all portfolios
 *
 * @returns Array of portfolios
 */
export async function findAllPortfolios(): Promise<Portfolio[]> {
  return await prisma.portfolio.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Finds or creates a default portfolio
 *
 * @returns Default portfolio
 */
export async function findOrCreateDefaultPortfolio(): Promise<Portfolio> {
  const portfolios = await findAllPortfolios();

  if (portfolios.length > 0) {
    return portfolios[0];
  }

  return await createPortfolio('My Portfolio');
}

/**
 * Deletes a portfolio
 *
 * @param portfolioId - Portfolio ID
 */
export async function deletePortfolio(portfolioId: string): Promise<void> {
  await prisma.portfolio.delete({
    where: { id: portfolioId },
  });
}
