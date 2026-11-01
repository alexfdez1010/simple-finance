-- Add simulation assumptions without changing existing holdings or history.
CREATE TABLE "runway_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "monthlyExpenses" DOUBLE PRECISION NOT NULL,
    "monthlyIncome" DOUBLE PRECISION NOT NULL,
    "annualInflation" DOUBLE PRECISION NOT NULL,
    "withdrawalRate" DOUBLE PRECISION NOT NULL,
    "targetYears" INTEGER NOT NULL,
    "monthlyContribution" DOUBLE PRECISION NOT NULL,
    "annualReturnOverride" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "runway_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "runway_settings_singleton" CHECK ("id" = 'default'),
    CONSTRAINT "runway_settings_expenses_range" CHECK ("monthlyExpenses" BETWEEN 0 AND 1000000000),
    CONSTRAINT "runway_settings_income_range" CHECK ("monthlyIncome" BETWEEN 0 AND 1000000000),
    CONSTRAINT "runway_settings_inflation_range" CHECK ("annualInflation" BETWEEN -0.2 AND 1),
    CONSTRAINT "runway_settings_withdrawal_range" CHECK ("withdrawalRate" BETWEEN 0.001 AND 0.2),
    CONSTRAINT "runway_settings_target_range" CHECK ("targetYears" BETWEEN 1 AND 50),
    CONSTRAINT "runway_settings_contribution_range" CHECK ("monthlyContribution" BETWEEN 0 AND 1000000000),
    CONSTRAINT "runway_settings_return_range" CHECK ("annualReturnOverride" IS NULL OR "annualReturnOverride" BETWEEN -0.99 AND 1)
);
