-- Defensive backfill: ensure every custom product has at least one
-- contribution before dropping the legacy snapshot columns. Existing
-- 20260504072001_add_custom_contributions already inserted one per row;
-- this re-runs the same insert only for rows still missing one (e.g.
-- products created between that migration and this one).
INSERT INTO "custom_product_contributions" (
    "id",
    "customProductDataId",
    "amount",
    "date",
    "note",
    "createdAt",
    "updatedAt"
)
SELECT
    'bf_' || cpd."id",
    cpd."id",
    cpd."initialInvestment",
    cpd."investmentDate",
    'First movement (auto-migrated)',
    NOW(),
    NOW()
FROM "custom_product_data" cpd
WHERE NOT EXISTS (
    SELECT 1 FROM "custom_product_contributions" cpc
    WHERE cpc."customProductDataId" = cpd."id"
);

-- Drop the legacy snapshot columns. The full history of deposits and
-- withdrawals now lives exclusively in custom_product_contributions.
ALTER TABLE "custom_product_data" DROP COLUMN "initialInvestment";
ALTER TABLE "custom_product_data" DROP COLUMN "investmentDate";
