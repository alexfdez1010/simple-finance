# Runway and FIRE simulation

`/dashboard/runway` starts with monthly living cost in EUR and annual inflation. Changes recalculate a local preview. **Save settings** persists a shared plan in PostgreSQL; reloading or opening the home dashboard uses the saved plan. There is no invented living-cost default. The initial 2% inflation and 4% withdrawal rate are editable assumptions, not current inflation data or a guaranteed safe withdrawal rate.

## Accounting model

All calculations use EUR and unrounded numbers. Only display formatting rounds amounts. Annual rates in stored settings and domain functions are decimals; form percentages are converted at the boundary.

- Starting capital is the current portfolio valuation, including gains already accrued. Those gains are never added again as income.
- The automatic annual return is weighted by the current value of every holding. Unknown expected returns contribute 0%, with their capital disclosed. A manual return overrides the estimate. The monthly equivalent is `(1 + annualReturn)^(1/12) - 1`.
- Drawdown starts today with a full monthly living cost. Later monthly costs compound by annual inflation. Each month adds returns on the remaining balance and fixed nominal external income, then subtracts costs. A final partial month prorates those flows. No funding shortfall within 600 months displays **50+ years**, rather than an infinite duration.
- Net monthly draw is the current cost minus external income minus the first month's estimated portfolio return. A negative draw is a surplus. Portfolio returns are estimated total return, not necessarily distributions paid in cash.
- FIRE capital today is monthly living cost multiplied by 12 and divided by the chosen annual withdrawal rate. Employment income does not lower this threshold. **FIRE** appears when current capital covers that target. This is a withdrawal-based scenario, not a guarantee of lifelong income.
- The future FIRE target increases with inflation. The accumulation chart compounds the capital and adds the explicitly planned monthly investment at month end. This investment is money left after living costs, so income and spending are not added or deducted again in this separate scenario.
- The required monthly investment solves the ordinary annuity formula for the inflation-adjusted target in the selected number of years. At zero return it divides the remaining gap by the number of months. Already-funded future targets require zero new investment.

The model assumes a stable portfolio mix and constant nominal returns. It uses total portfolio value regardless of liquidation time. Taxes, fees, market volatility and changes in income are excluded. A negative holding balance or an unsupported numeric projection produces a recoverable unavailable result rather than dropping liabilities or breaking the dashboard.

## Public module usage

Import `computeRunwayProjection` from `src/lib/domain/services/runway-projection.ts` and call `computeRunwayProjection(products, settings)`. For example, 12,000 EUR capital, 1,000 EUR monthly living cost, no external income and zero inflation/return produces 12 months of runway. A 4% withdrawal assumption gives a 300,000 EUR FIRE target at that monthly cost.

`RunwaySettings` and the minimal `RunwayHolding` contract live in `src/lib/domain/models/runway.types.ts`. Rates are annual decimals. For example, set `annualInflation` to `0.02`, `withdrawalRate` to `0.04`, `annualReturnOverride` to `null`, and `targetYears` to `10`. `monthlyContribution` belongs only to the accumulation scenario.

Use `computeSafeRunwayProjection(products, settings)` from `src/lib/domain/services/safe-runway-projection.ts` at rendering boundaries to obtain a projection or a recoverable model error. Unexpected programming errors propagate.

Call `getRunwaySettings()` to retrieve the saved settings or `null` before configuration. `saveRunwaySettings(settings)` is the repository boundary for validated assumptions. UI clients call `saveRunwaySettingsAction(settings)` instead: it checks the existing password session, validates all ranges, upserts the singleton and invalidates dashboard routes. For example, submit the decimal-rate settings above and check `success` before displaying confirmation. Neither operation modifies holdings or snapshots.

`loadRunwayPage()` composes valued holdings, display rates and settings without reading historical snapshots. Render `RunwayWorkspace` with its minimal products and settings inside `CurrencyWorkspace`; render `RunwaySummary` with the same contracts for the home dashboard. `RunwayFields` renders primary and secondary inputs; `readRunwayForm(formElement)` converts form values and returns a Zod validation result. `formatRunwayMonths(months)` formats the bounded duration. `RunwayResults` and `RunwayCharts` accept `{projection, settings}` from the same engine. `ProjectionChart` accepts a title, description and monthly balance series, with an optional FIRE-target series. Shared mathematical helpers validate assumptions, derive weighted portfolio assumptions, convert effective rates, and solve fixed monthly saving; they perform no I/O.

## Persistence and deployment

The additive migration `20261101140000_add_runway_settings` creates `runway_settings` with a singleton constraint and numeric checks. Existing portfolios remain untouched. The existing Vercel production pipeline already runs `prisma generate`, the Next.js build, and `database:deploy` before promoting a deployment. No deployment-command change is required. Outside that pipeline, run `bun run database:deploy` with the intended database configured before serving this revision, and regenerate the Prisma client.

## Design and maintenance decisions

Monthly cost is the primary figure and primary input. Inflation remains visible beside it. Income, planned saving, horizon and withdrawal/return assumptions are disclosed under **Income & simulation settings**. The existing blue, graphite, Geist typography, Tailwind 4 and shared HeroUI-backed shadcn-style adapters remain the visual system. Drawdown and accumulation get separate labelled charts and accessible yearly tables; neither graph implies that projected returns are earned cash. The existing workspace transition supplies continuity, and chart redraws stay immediate without replaying animations on each keystroke.

The portfolio is shared by the app's single password session, so the plan is also shared. Keep an absent plan distinct from a configured zero-cost plan. Do not replace unknown expected returns with the productive-subset rate from `calculateProfitRatesSync`, which excludes unknown capital from its denominator. Do not use snapshot-based monthly investment gains as recurring spendable income.

## Verification

Run `bun run lint-format`, `bun run test:unit` and `bun run build`. Apply migrations to a disposable database and run `bunx playwright test tests/e2e/runway.spec.ts tests/e2e/workspace-routes.spec.ts` against a server using that same database. The E2E suite clears its target database; never point it at a personal or production portfolio. It verifies first configuration, save/reload, unsaved previews, dashboard propagation, a zero-growth savings example, FIRE excluding salary, mobile navigation and readable chart figures.

Implementation references: [Next.js data updates](https://nextjs.org/docs/app/getting-started/updating-data), [React transition state](https://react.dev/reference/react/useTransition), [Prisma v6 deployment migrations](https://www.prisma.io/docs/orm/v6/prisma-migrate/workflows/development-and-production), [Tailwind utility styling](https://tailwindcss.com/docs/styling-with-utility-classes), [Recharts](https://recharts.github.io/en-US/api/LineChart/), [ECB inflation explanation](https://www.ecb.europa.eu/ecb-and-you/explainers/tell-me-more/html/what_is_inflation.en.html) and [Investor.gov compound interest calculator](https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator).
