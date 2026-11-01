-- Keep retired columns for rollback while new settings omit them completely.
ALTER TABLE "runway_settings"
    ALTER COLUMN "monthlyIncome" SET DEFAULT 0,
    ALTER COLUMN "withdrawalRate" SET DEFAULT 0.04,
    ALTER COLUMN "targetYears" SET DEFAULT 10;
