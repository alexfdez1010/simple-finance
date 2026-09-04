-- Expand phase: nullable keeps old and new application versions compatible
-- while legacy rows are backfilled idempotently by the application.
ALTER TABLE "custom_product_contributions" ADD COLUMN "amountEur" DOUBLE PRECISION;
