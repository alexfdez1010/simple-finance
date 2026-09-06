-- Preserve historical valuations. Legacy bases are reconstructed at read time.
-- Apply before deploying the snapshot writer; old inserts remain compatible.
ALTER TABLE "portfolio_snapshots" ADD COLUMN "investedEur" DOUBLE PRECISION;
