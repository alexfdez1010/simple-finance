# Custom interest calculations

The `reinvestInterest` boolean belongs to each custom product. It is true by default for existing and new rows, and when importing a backup that predates the field. False survives export/import. D1 migration `0005_reinvest_interest.sql` is additive and preserves existing values and movement histories.

With reinvestment, each signed movement grows by `(1 + annualReturnRate / 365) ^ days`. Without reinvestment, each grows by `1 + annualReturnRate × days / 365`. Future movements do not contribute to value or earning principal. Negative movements reduce both. Values remain in the native currency until the existing EUR conversion boundary; frozen EUR cost bases remain unchanged.

Accrued simple interest remains part of total wealth, but produces no additional contractual interest. Expected annual yield therefore scales the contractual rate by effective native principal divided by current native value. Currency appreciation remains independent and can affect the entire native balance. Dashboard totals, profit rates, allocation, liquidity and scheduled snapshots consume the shared enriched values. Historical snapshots remain recorded facts; today's point recalculates with the selected setting.

History projections grow simple yield linearly from the effective principal, then apply the currency growth estimate. Runway and FIRE keep individual simple-interest balances separate from compound balances. Withdrawals reduce holdings proportionally; new simulated investments follow the initial portfolio allocation and become earning principal. FIRE's future target follows earning capacity, so accumulated simple interest alone cannot create recurring income. Portfolios with all reinvestment enabled retain the prior aggregate model.

## Public API usage

Call `calculateCustomProductValueFromContributions(contributions, rate, date, reinvestInterest)` to value a holding. For example, 1,000 EUR at 10% for 730 days with false returns 1,200 EUR. Omitting the last argument keeps daily compounding.

Creation commands and `add_custom_asset` accept optional `reinvestInterest`, defaulting to true. `updateCustomProduct` and `update_custom_asset` accept an optional value; omission preserves the saved choice. For example, call `update_custom_asset` with the existing id, name, annualReturnRate, assetCategory, daysToLiquidity and `reinvestInterest: false` to switch the holding to simple interest. Currency remains immutable.

`createCustomProductAction` accepts the boolean after daysToLiquidity. `updateCustomProductAction` accepts it after daysToLiquidity too. Both forms send an explicit choice. `effectiveCustomPrincipal(movements, date)` returns effective signed principal and `customInterestYield(principal, value, rate, reinvest)` returns its yield relative to value.

`createRunwayGrowth(products)` creates isolated mutable projection state; create one instance per scenario. Its callable computes monthly growth, and its optional `annualReturn(balance)` reports effective income capacity for FIRE. Pass the enriched product's optional `simpleInterest` metadata through view boundaries. `simulateYahooFuture` accepts the same metadata as its optional fifth argument. It retains its prior behavior without this argument.

## Verification and references

Run `bun run lint-format`, `bun run test:unit`, `bunx tsc --noEmit` and `bun run test:e2e`. Regression cases cover signed and future movements, multiple years, default compatibility, dashboard enrichment, mixed portfolios, proportional withdrawals, new contributions, FIRE income limits, history FX and legacy backups. The reinvestment E2E covers creating, reloading, editing and persistence.

The checkbox uses the [HeroUI Checkbox](https://heroui.com/en/docs/react/components/checkbox) controlled API. The schema uses [Prisma v6 SQLite boolean mapping](https://www.prisma.io/docs/orm/v6/overview/databases/sqlite).
