/*
  Warnings:

  - You are about to drop the `portfolios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."financial_products" DROP CONSTRAINT "financial_products_portfolioId_fkey";

-- DropTable
DROP TABLE "public"."portfolios";
