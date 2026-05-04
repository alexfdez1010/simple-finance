-- CreateTable
CREATE TABLE "custom_product_contributions" (
    "id" TEXT NOT NULL,
    "customProductDataId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amountEur" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_product_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_product_contributions_customProductDataId_date_idx" ON "custom_product_contributions"("customProductDataId", "date");

-- AddForeignKey
ALTER TABLE "custom_product_contributions" ADD CONSTRAINT "custom_product_contributions_customProductDataId_fkey" FOREIGN KEY ("customProductDataId") REFERENCES "custom_product_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one initial contribution per existing custom product, in EUR
-- (initialInvestment is already stored in EUR; amount column mirrors it for legacy records).
INSERT INTO "custom_product_contributions" (
    "id",
    "customProductDataId",
    "amount",
    "amountEur",
    "date",
    "note",
    "createdAt",
    "updatedAt"
)
SELECT
    'cinit_' || "id",
    "id",
    "initialInvestment",
    "initialInvestment",
    "investmentDate",
    'Initial investment (auto-migrated)',
    "createdAt",
    "updatedAt"
FROM "custom_product_data";
