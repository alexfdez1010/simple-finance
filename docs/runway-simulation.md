# Runway and FIRE simulation

`/dashboard/runway` has three saved inputs: monthly living cost in EUR, annual inflation, and monthly FIRE investment in EUR. Cost and inflation appear first, followed by the Runway results and chart. The FIRE section below contains its monthly contribution input, calculated time to independence, and accumulation chart. Changes preview immediately; **Save settings** persists the whole plan and updates the dashboard. An absent plan remains distinct from a configured zero-cost lifestyle. The initial 2% inflation is an editable assumption, not live inflation data.

## Accounting model

All amounts use EUR and unrounded calculations. Stored annual inflation is a decimal; the form converts percentages. Portfolio returns always come from the value-weighted expected annual returns of all current holdings. Unknown returns contribute 0% and their capital is disclosed. Accrued gains already included in the current valuation are counted once.

Runway starts with the current portfolio value. Each month earns the nominal monthly-equivalent return on the remaining capital and pays the living cost, which increases with compounded inflation from the second month. There is no separate salary input. A final partial month prorates the cash flows. No funding shortfall within 600 months displays **50+ years**, not a claim of permanent funding.

FIRE compares monthly living costs with portfolio returns after inflation. The effective real monthly rate is `((1 + annualReturn) / (1 + annualInflation))^(1/12) - 1`. Today's required capital is monthly living cost divided by that real monthly rate. The available monthly amount is current capital times that rate, floored at zero for display. The monthly gap is the portion of today's cost not covered by it.

If the real return is zero or negative and costs are positive, the FIRE target is unavailable. Zero costs have a zero target. The model never substitutes a hidden withdrawal percentage or a deadline. The nominal future target rises with inflation. Accumulation compounds capital at the nominal return and adds the entered fixed monthly investment at month end. That investment is money left after living costs, so expenses are not deducted again from this separate scenario.

Time to FIRE is the first month when the accumulation balance reaches the inflation-adjusted target, searched through 600 months. The chart ends at the whole-year boundary containing that crossing, with a minimum of one year. If there is no crossing, it displays the 50-year simulation. Changing the monthly investment changes the resulting time, not the current FIRE target or Runway.

This deterministic model assumes a stable portfolio mix and constant returns. It uses total portfolio value including illiquid assets, and excludes taxes, fees and market volatility. FIRE is a return-coverage estimate rather than guaranteed income. Negative holding balances or numeric overflow produce a recoverable unavailable result without dropping liabilities or breaking the dashboard.

## Public module usage

Call `computeRunwayProjection(products, settings)` from `src/lib/domain/services/runway-projection.ts` with minimal holdings containing current EUR value and expected annual return. Settings contain only `monthlyExpenses`, `annualInflation` and `monthlyContribution`. For example, 12,000 EUR capital, 1,000 EUR monthly cost, zero inflation and a zero portfolio return produces 12 months of Runway and no return-funded FIRE target. Increasing the FIRE contribution does not change those 12 months.

Use `computeSafeRunwayProjection(products, settings)` at rendering boundaries to obtain a projection or an actionable model error. Unexpected programming errors propagate. Shared pure helpers validate inputs, weight the portfolio return, convert effective rates and project accumulation. They do not read data or mutate inputs. `calculateFireCoverage(capital, annualReturn, settings)` derives the real-return-funded target; `projectFireAccumulation(capital, monthlyRate, fireTarget, settings, horizonMonths)` finds its first crossing. For example, use a 600-month bound and a null target to obtain an accumulation chart without asserting that FIRE is reachable.

`getRunwaySettings()` returns the three saved assumptions or `null`. `saveRunwaySettings(settings)` is the repository boundary. UI clients call `saveRunwaySettingsAction(settings)`, which authenticates, validates, upserts and invalidates dashboard routes; check `success` before confirming a save. `loadRunwayPage()` composes current holdings, display rates and settings without historical snapshots. Render `RunwayWorkspace` inside `CurrencyWorkspace`, and use `RunwaySummary` for the dashboard. `readRunwayForm(formElement)` converts form values and validates them. `formatRunwayMonths(months)` formats the bounded duration. `RunwayFields` accepts settings and save actions; `RunwayNumberField` renders each labelled input. `RunwayResults` accepts projection and settings, `FireResults` accepts the projection, and `RunwayCharts` selects its runway or fire scenario. `RunwayAssumptions` keeps methodology collapsed. Charts expose yearly tables and omit an unavailable FIRE target rather than plotting zero.

## Persistence and deployment

The initial `20261101140000_add_runway_settings` migration creates the singleton settings table. `20261101150000_retire_fire_assumptions` adds defaults for legacy income, withdrawal and deadline columns, allowing the new three-field insert without deleting stored data. Legacy columns remain only for rollback compatibility and are excluded from active reads and writes. Their values have no effect on either simulation. Holdings and snapshots are unchanged.

Production now runs on Cloudflare Workers and D1 SQLite. Run `bun run database:deploy` to apply D1 migrations, then `bun run deploy` to generate Prisma types, build with OpenNext and publish the Worker. See [Cloudflare deployment](cloudflare-deployment.md).

## Design and maintenance decisions

Keep the interface at three parameters. Monthly living cost and inflation belong at the top; monthly investment belongs in the lower FIRE section. The number of years is a computed result. Preserve this section order and the wide desktop inputs. Keep copy to labels, units and outcomes; calculation details stay collapsed. Use the existing blue, graphite, Geist, Tailwind 4 and shared HeroUI-backed adapters, with immediate chart updates and reduced-motion support.

The plan is shared by the app's single password session. Do not use snapshot gains as recurring cash income or the productive-subset percentage from `calculateProfitRatesSync`, which excludes unknown-return capital from its denominator. Do not reintroduce hidden withdrawal or deadline assumptions when simplifying the UI.

## Verification

Run `bun run lint-format`, `bun run test:unit` and `bun run build`. Apply migrations to a disposable database, then run `bunx playwright test tests/e2e/runway.spec.ts tests/e2e/workspace-routes.spec.ts` against a server using that database. The E2E suite clears its target database. Tests cover save/reload, unsaved previews, expired-session recovery, legacy-value independence, contribution-derived FIRE time, three-input section placement and mobile layout.

References: [nominal and real return conversion](https://pages.stern.nyu.edu/~adamodar/pdfiles/FoundationsOnline/slides/session10.pdf), [Federal Reserve explanation of real returns](https://www.frbsf.org/research-and-insights/publications/doctor-econ/2003/08/real-nominal-interest-rate/), [Next.js data updates](https://nextjs.org/docs/app/getting-started/updating-data), [Prisma v6 deployment migrations](https://www.prisma.io/docs/orm/v6/prisma-migrate/workflows/development-and-production), [Tailwind utility styling](https://tailwindcss.com/docs/styling-with-utility-classes) and [Recharts](https://recharts.github.io/en-US/api/LineChart/).
