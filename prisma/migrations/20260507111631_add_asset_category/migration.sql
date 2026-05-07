-- CreateEnum
CREATE TYPE "asset_category" AS ENUM ('STOCKS', 'BONDS_LOANS', 'COMMODITIES', 'REAL_ESTATE', 'CASH');

-- AlterTable
ALTER TABLE "custom_product_data" ALTER COLUMN "currency" DROP DEFAULT;

-- AlterTable
ALTER TABLE "financial_products" ADD COLUMN     "assetCategory" "asset_category" NOT NULL DEFAULT 'STOCKS';

-- CreateIndex
CREATE INDEX "financial_products_assetCategory_idx" ON "financial_products"("assetCategory");
