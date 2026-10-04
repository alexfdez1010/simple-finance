# Portfolio experience

The dashboard uses a cool glass surface system with Tailwind CSS 4, Geist typography, white edge highlights and translucent panels. Shared card components retain the existing compositional API. Existing HeroUI controls retain their accessible interaction behavior. Reduced-motion preferences disable entry animations; reduced-transparency preferences make glass panels opaque.

## Explore the portfolio

- Dashboard navigation is immediately below the header. Charts contains the shared valuation summary, portfolio insights and analytics; Products and Skill open their own workspaces directly, without scrolling through the summary first. Keyboard navigation follows the existing HeroUI tabs contract.
- Charts → Overview shows valuation history, monthly wealth, top performers and invested capital versus value.
- Charts → Allocation groups holdings by product, category and currency and shows contribution to gains.
- Charts → Cash flow shows movements and the configured liquidity curve.
- Charts → Risk shows snapshot changes, rolling changes, drawdowns, distribution and the calendar heatmap. These snapshot-based measures include external cash flows; they are not cash-flow-adjusted returns.
- Products → Search holdings matches name, ticker or native currency. For example, enter “EUR” to find custom euro holdings. Sort holdings offers highest value, highest absolute EUR gain and alphabetical order. Clearing a search restores the full list.
- Products → Clear search restores all holdings, keeps the selected sort and returns focus to the search field. A search with no results explains how to recover and provides a Show all holdings action. The empty portfolio offers an Add Product action.
- Product cards show complete holding names and wrap large amounts. History, edit and delete controls have at least 44 px touch targets and identify the relevant holding through their accessible group and description.
- Movement editors associate each label with a unique field ID. Long movement notes and amounts wrap inside the dialog, and pending writes disable the controls.
- History errors provide a Retry history action. Late responses from an earlier selection or a closed dialog cannot replace the active history. Copy controls announce success or failure, allow retry after denial and block overlapping writes.
- The global display currency applies to insight amounts as well as existing portfolio values. Percentages remain currency independent.

## Statistics and public module usage

`computePortfolioInsights` in `src/lib/domain/services/portfolio-insights.ts` accepts a readonly list of `InsightHolding` values and returns descriptive diagnostics without side effects. Invoke it with the already enriched EUR portfolio, for example `computePortfolioInsights(productsWithValues)`. Passing an empty list returns null percentages; callers must display missing values rather than imply zero.

`PortfolioInsights` accepts the same list through its `holdings` prop. Render it within `DisplayCurrencyProvider` so liquidity amounts follow the active currency. `ProductsPanel` accepts products and the existing add, edit, delete and history callbacks; `DashboardTabs` composes it with charts and insights.

`queryHoldings` in `src/components/dashboard/holdings-query.ts` is a pure view helper: invoke `queryHoldings(productsWithValues, 'EUR', 'value')` to obtain a filtered, sorted copy. `HoldingsSort` accepts `value`, `gain` or `name`. Empty or whitespace queries match all holdings; EUR gain ordering uses enriched values rather than display-currency text. Inputs and their order remain untouched.

`HoldingsToolbar` renders the controlled query and sort UI. Invoke it with `query`, `sort`, `onQueryChange` and `onSortChange` inside a holdings workspace. It delegates every change to the caller and does not fetch or mutate portfolio data.

`ProductCard` accepts a financial product, enriched valuation props and optional `onView`, `onEdit` and `onDelete` callbacks. Render it within `DisplayCurrencyProvider`, passing the same prepared product to each callback; omitted callbacks omit their actions. `DetailItem` renders a definition pair from `label`, `value` and an optional value class, preserving complete metric text.

`ContributionFormRow` accepts `form`, `setForm`, `symbol`, `busy`, `onSave` and `onCancel`. For example, pass a signed amount, UTC date and optional note as controlled strings to edit a movement. `ContributionRow` accepts the stored `contribution`, `symbol`, `busy`, `onEdit` and `onDelete`; compose it inside the existing movement list. Both delegate writes to their parent.

`ProductHistoryDialog` retains its `product`, `open` and `onOpenChange` contract. Pass the selected product and a controlled open flag; the component loads history on opening and retry, and ignores obsolete responses. `CopyButton` takes `value` and an optional `label`: use it with the exact configuration string to copy. Clipboard failure remains visible until the next attempt; success resets after 1.5 seconds and timers are cleared on unmount.

`DashboardHeader` takes `onAddYahoo` and `onAddCustom` callbacks and composes `CurrencySelector` inside `DisplayCurrencyProvider`. `ProfitRateDisplay` takes prepared `profitRates` within that provider; its period control cycles daily, weekly, monthly and annual estimates and announces the changed amount. The selected global currency applies throughout all workspaces.

- Largest position: largest positive holding value divided by total positive holding value. It measures concentration by product, not underlying issuer or fund overlap.
- Available within 7 days: positive values with configured liquidity horizons from zero through seven days. This describes potential proceeds at current valuations, not guaranteed sale prices.
- Profitable holdings: holdings above a finite, positive invested basis. Break-even holdings are not counted as profitable; zero or negative cost bases are not comparable.
- Forecast coverage: positive portfolio value with finite expected-return estimates, including a zero estimate. Coverage does not measure estimate accuracy.
- Non-finite valuations are excluded and counted visibly. Negative balances do not create available liquidity or reduce the positive-allocation denominator.
- Latest change shows the date of the latest available snapshot difference; absent history displays an em dash. Projected profit is explicitly labeled estimated.
- Evolution controls select the latest 30, 60 or 90 observations, labeled “pts”; irregular histories are not presented as consecutive days.

## Verification

Run `bun run lint-format`, `bun run test:unit`, and `bun run build`. End-to-end tests include portfolio insight calculations, analytics navigation, product search and sorting, editing, and mobile overflow checks. Run the Playwright suite against the isolated database from `compose-test.yml`, with `DATABASE_URL` pointing to port 5434 and the server and tests sharing test authentication settings. The suite clears its target database.

## References

- [Tailwind backdrop blur](https://tailwindcss.com/docs/backdrop-filter-blur)
- [React derived state guidance](https://react.dev/learn/you-might-not-need-an-effect)
- [Next.js server and client components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [shadcn compositional card API](https://ui.shadcn.com/docs/components/card)

## Maintenance notes

Keep diagnostics in the pure domain service and rendering in small components (single responsibility and interface segregation). Do not add fetching to the insight cards or change historical accounting to implement a visual enhancement. The existing UI adapter layer preserves stable callers while the surface system changes (open/closed principle). No dependencies or database schema changes are required.

## Monthly investment gains

Charts → Overview → Monthly Investment Gains shows monetary gains for completed months: closing portfolio value minus the previous month's closing value minus signed net contributions. For example, a previous close of €1,000, a new close of €1,350, deposits of €500 and withdrawals of −€200 produce a €50 gain. Negative gains remain losses. The tooltip and “View monthly breakdown” expose every term.

`computeMonthlyInvestmentGains(snapshots, invested, today)` in `src/lib/domain/services/monthly-investment-gains.ts` is a pure function taking daily ISO EUR valuations, cumulative EUR invested amounts aligned by date, and an explicit UTC ISO current date. For example, call it with the annual snapshot series, `await getInvestedSeries(products, snapshots.map(point => point.date))`, and `new Date().toISOString().slice(0, 10)`. It returns sorted `MonthlyInvestmentGain` rows. The full annual series is used independently of the 90-point evolution chart.

`MonthlyInvestmentGainsChart` takes those rows in its `data` prop inside `DisplayCurrencyProvider`; for example render it alongside `MonthlyWealthChart` in the Overview grid. No fetching or mutations occur inside either the calculator or chart. Empty data renders a history explanation.

Both exact calendar month-end snapshots and their cost bases are required. Missing boundaries, the first month without an opening close, non-finite data and the current unfinished month are omitted, never estimated. Leap years and year boundaries use UTC. Contributions reuse the stored historical EUR basis for custom products and the existing Yahoo purchase cost convention. Results depend on the accuracy/completeness of recorded movements and valuations; edited/deleted holdings cannot reconstruct an immutable historical transaction ledger. Display currency conversion follows the dashboard's existing EUR-based formatting.

Maintenance decision: keep the calculation in a pure service (single responsibility), reuse the existing contribution aggregation (dependency on focused value inputs), and compose the new card into Overview without changing other charts. Regression coverage includes withdrawals, loss/zero months, missing boundaries, leap years, and integration with both contribution sources.

Chart API reference: [Recharts Bar](https://recharts.github.io/en-US/api/Bar/).

## Maintenance decisions — 2026-10-04

Preserve the established glass surfaces, Geist type, finance semantics and HeroUI adapters. Scope this update to task access, responsive content, accessible controls and recoverable states. The project already uses HeroUI throughout; introducing a second control library would create inconsistent interaction contracts, so refinement composes the incumbent components.

Single responsibility separates the pure holdings query from controls and workspace composition. Focused callback props keep presentation independent of mutations and remove the holdings workspace's dependency on the broader dashboard props. Product deletion dialogs remount for each selection so a prior holding's failure cannot appear for a new holding.

Run database-backed checks against a dedicated database: the existing Playwright setup deletes products. The standard authentication tests assume the example password, so the local test server and test process must agree on that value. Keep screenshots and temporary fixtures outside the repository.

Official implementation references: [Next.js server/client composition](https://nextjs.org/docs/app/getting-started/server-and-client-components), [React component props](https://react.dev/learn/passing-props-to-a-component), [React useId](https://react.dev/reference/react/useId), [React effect cleanup](https://react.dev/reference/react/useEffect), [Tailwind responsive utilities](https://tailwindcss.com/docs/responsive-design), [HeroUI Button](https://heroui.com/docs/react/components/button).

Validation for this update: 131 unit tests passed; all 53 existing E2E flows passed and six new production E2E cases passed. The keyboard setup uses a real tab interaction before asserting keyboard navigation, avoiding reliance on programmatic focus during page startup. Lint/format and the production build passed. The build retains a Prisma/Turbopack file-tracing warning from unchanged infrastructure. Desktop/mobile checks covered 320, 390, 768 and 1440 px, with no horizontal overflow or JavaScript page errors. Every changed production code file remains below 200 lines.
