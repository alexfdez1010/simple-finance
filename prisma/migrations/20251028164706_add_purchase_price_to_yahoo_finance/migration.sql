-- CreateEnum
CREATE TYPE "product_type" AS ENUM ('YAHOO_FINANCE', 'CUSTOM');

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_products" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "type" "product_type" NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yahoo_finance_data" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yahoo_finance_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_product_data" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "annualReturnRate" DOUBLE PRECISION NOT NULL,
    "initialInvestment" DOUBLE PRECISION NOT NULL,
    "investmentDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_product_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_snapshots" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_products_portfolioId_idx" ON "financial_products"("portfolioId");

-- CreateIndex
CREATE INDEX "financial_products_type_idx" ON "financial_products"("type");

-- CreateIndex
CREATE UNIQUE INDEX "yahoo_finance_data_productId_key" ON "yahoo_finance_data"("productId");

-- CreateIndex
CREATE INDEX "yahoo_finance_data_symbol_idx" ON "yahoo_finance_data"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "custom_product_data_productId_key" ON "custom_product_data"("productId");

-- CreateIndex
CREATE INDEX "product_snapshots_productId_idx" ON "product_snapshots"("productId");

-- CreateIndex
CREATE INDEX "product_snapshots_date_idx" ON "product_snapshots"("date");

-- CreateIndex
CREATE UNIQUE INDEX "product_snapshots_productId_date_key" ON "product_snapshots"("productId", "date");

-- AddForeignKey
ALTER TABLE "financial_products" ADD CONSTRAINT "financial_products_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yahoo_finance_data" ADD CONSTRAINT "yahoo_finance_data_productId_fkey" FOREIGN KEY ("productId") REFERENCES "financial_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_product_data" ADD CONSTRAINT "custom_product_data_productId_fkey" FOREIGN KEY ("productId") REFERENCES "financial_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_snapshots" ADD CONSTRAINT "product_snapshots_productId_fkey" FOREIGN KEY ("productId") REFERENCES "financial_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
