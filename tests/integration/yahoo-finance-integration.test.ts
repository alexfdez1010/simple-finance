/**
 * Integration tests for Yahoo Finance functionality
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/infrastructure/database/prisma-client';

describe('Yahoo Finance Integration', () => {
  let portfolioId: string;

  beforeAll(async () => {
    // Create a test portfolio
    const portfolio = await prisma.portfolio.create({
      data: {
        name: 'Test Portfolio for Yahoo Finance',
      },
    });
    portfolioId = portfolio.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.portfolio.delete({
      where: { id: portfolioId },
    });
  });

  describe('Portfolio with Yahoo Finance products', () => {
    it('should create a portfolio successfully', async () => {
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
      });

      expect(portfolio).toBeDefined();
      expect(portfolio?.name).toBe('Test Portfolio for Yahoo Finance');
    });

    it('should handle multiple products in a portfolio', async () => {
      // Create multiple financial products
      const product1 = await prisma.financialProduct.create({
        data: {
          portfolioId,
          type: 'YAHOO_FINANCE',
          name: 'Apple Stock',
          quantity: 10,
          yahoo: {
            create: {
              symbol: 'AAPL',
            },
          },
        },
        include: {
          yahoo: true,
        },
      });

      const product2 = await prisma.financialProduct.create({
        data: {
          portfolioId,
          type: 'YAHOO_FINANCE',
          name: 'Microsoft Stock',
          quantity: 5,
          yahoo: {
            create: {
              symbol: 'MSFT',
            },
          },
        },
        include: {
          yahoo: true,
        },
      });

      expect(product1.yahoo?.symbol).toBe('AAPL');
      expect(product2.yahoo?.symbol).toBe('MSFT');

      // Clean up
      await prisma.financialProduct.delete({
        where: { id: product1.id },
      });
      await prisma.financialProduct.delete({
        where: { id: product2.id },
      });
    });

    it('should create product snapshots for historical tracking', async () => {
      const product = await prisma.financialProduct.create({
        data: {
          portfolioId,
          type: 'YAHOO_FINANCE',
          name: 'Google Stock',
          quantity: 3,
          yahoo: {
            create: {
              symbol: 'GOOGL',
            },
          },
        },
        include: {
          yahoo: true,
        },
      });

      // Create snapshots for different dates
      const snapshot1 = await prisma.productSnapshot.create({
        data: {
          productId: product.id,
          date: new Date('2024-01-01'),
          value: 150.5,
          quantity: 3,
        },
      });

      const snapshot2 = await prisma.productSnapshot.create({
        data: {
          productId: product.id,
          date: new Date('2024-01-02'),
          value: 155.75,
          quantity: 3,
        },
      });

      expect(snapshot1.value).toBe(150.5);
      expect(snapshot2.value).toBe(155.75);

      // Clean up
      await prisma.productSnapshot.delete({
        where: { id: snapshot1.id },
      });
      await prisma.productSnapshot.delete({
        where: { id: snapshot2.id },
      });
      await prisma.financialProduct.delete({
        where: { id: product.id },
      });
    });

    it('should retrieve products with their snapshots', async () => {
      const product = await prisma.financialProduct.create({
        data: {
          portfolioId,
          type: 'YAHOO_FINANCE',
          name: 'Tesla Stock',
          quantity: 2,
          yahoo: {
            create: {
              symbol: 'TSLA',
            },
          },
        },
        include: {
          yahoo: true,
        },
      });

      const snapshot = await prisma.productSnapshot.create({
        data: {
          productId: product.id,
          date: new Date('2024-01-01'),
          value: 250.0,
          quantity: 2,
        },
      });

      // Retrieve product with snapshots
      const retrievedProduct = await prisma.financialProduct.findUnique({
        where: { id: product.id },
        include: {
          snapshots: true,
          yahoo: true,
        },
      });

      expect(retrievedProduct?.snapshots).toHaveLength(1);
      expect(retrievedProduct?.snapshots[0].value).toBe(250.0);

      // Clean up
      await prisma.productSnapshot.delete({
        where: { id: snapshot.id },
      });
      await prisma.financialProduct.delete({
        where: { id: product.id },
      });
    });
  });
});
