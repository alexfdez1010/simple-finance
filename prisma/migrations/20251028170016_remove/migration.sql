/*
  Warnings:

  - You are about to drop the column `portfolioId` on the `financial_products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."financial_products_portfolioId_idx";

-- AlterTable
ALTER TABLE "financial_products" DROP COLUMN "portfolioId";
