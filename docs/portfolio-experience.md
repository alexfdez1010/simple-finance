# Portfolio experience

The application uses opaque white surfaces on a mist-gray ground, forest-green navigation and actions, Geist typography, and aligned financial figures. Tailwind CSS 4 supplies the tokens and responsive layouts. Shared compositional card/button adapters and existing HeroUI form controls preserve their interaction contracts. Charts render without entrance animations.

## Explore the portfolio

- Home (`/dashboard`) is the landing dashboard: current balance, invested capital, return, latest snapshot change, projected profit, recent evolution, asset-class composition, five largest holdings, and portfolio diagnostics.
- Holdings (`/dashboard/portfolio`) owns search, sorting, adding, editing, deleting, contribution management, and product history. Search matches name, ticker, or native currency; sort by highest value, highest absolute EUR gain, or name.
- Analytics overview (`/dashboard/analytics`) shows evolution, completed-month investment gains, monthly wealth, performers, and invested capital versus value.
- Allocation (`/dashboard/analytics/allocation`) groups holdings by product, category, and currency and shows contribution to gains.
- Cash flow (`/dashboard/analytics/cash-flow`) shows signed custom-product movements and the configured liquidity curve.
- Risk (`/dashboard/analytics/risk`) shows snapshot changes, rolling changes, drawdowns, distribution, and the calendar heatmap. These measures include external cash flows; they are not cash-flow-adjusted investment returns.
- Agent setup (`/dashboard/skill`) owns skill/config downloads and MCP connection details. It reads no portfolio, snapshot, contribution, or display-rate data.
- Navigation uses real links with `aria-current`, supports keyboard activation, deep links, reloads, and browser back/forward. Desktop uses a persistent rail; mobile presents four visible destinations. Data prefetching is disabled on workspace links to avoid loading other sections before they are needed.
- An empty holdings portfolio offers an Add Product action. Clearing search restores the complete list and returns focus to its field; a failed search offers Show all holdings.
- Product cards show complete holding names and wrap large amounts. History, edit and delete controls have at least 44 px touch targets and identify the relevant holding through their accessible group and description.
- Movement editors associate each label with a unique field ID. Long movement notes and amounts wrap inside the dialog, and pending writes disable the controls.
- History errors provide a Retry history action. Late responses from an earlier selection or a closed dialog cannot replace the active history. Copy controls announce success or failure, allow retry after denial and block overlapping writes.
- The global display currency applies to insight amounts as well as existing portfolio values. Percentages remain currency independent.

## Statistics and public module usage

`computePortfolioInsights` in `src/lib/domain/services/portfolio-insights.ts` accepts a readonly list of `InsightHolding` values and returns descriptive diagnostics without side effects. Invoke it with the already enriched EUR portfolio, for example `computePortfolioInsights(productsWithValues)`. Passing an empty list returns null percentages; callers must display missing values rather than imply zero.

`PortfolioInsights` accepts the same list through its `holdings` prop. Render it within `DisplayCurrencyProvider` so liquidity amounts follow the active currency. `ProductsPanel` accepts products and the existing add, edit, delete and history callbacks; `HoldingsWorkspace` composes it with focused management state; set `showHeading={false}` when a page-level heading already exists.

`queryHoldings` in `src/components/dashboard/holdings-query.ts` is a pure view helper: invoke `queryHoldings(productsWithValues, 'EUR', 'value')` to obtain a filtered, sorted copy. `HoldingsSort` accepts `value`, `gain` or `name`. Empty or whitespace queries match all holdings; EUR gain ordering uses enriched values rather than display-currency text. Inputs and their order remain untouched.

`HoldingsToolbar` renders the controlled query and sort UI. Invoke it with `query`, `sort`, `onQueryChange` and `onSortChange` inside a holdings workspace. It delegates every change to the caller and does not fetch or mutate portfolio data.

`ProductCard` accepts a financial product, enriched valuation props and optional `onView`, `onEdit` and `onDelete` callbacks. Render it within `DisplayCurrencyProvider`, passing the same prepared product to each callback; omitted callbacks omit their actions. `DetailItem` renders a definition pair from `label`, `value` and an optional value class, preserving complete metric text.

`ContributionFormRow` accepts `form`, `setForm`, `symbol`, `busy`, `onSave` and `onCancel`. For example, pass a signed amount, UTC date and optional note as controlled strings to edit a movement. `ContributionRow` accepts the stored `contribution`, `symbol`, `busy`, `onEdit` and `onDelete`; compose it inside the existing movement list. Both delegate writes to their parent.

`ProductHistoryDialog` retains its `product`, `open` and `onOpenChange` contract. Pass the selected product and a controlled open flag; the component loads history on opening and retry, and ignores obsolete responses. `CopyButton` takes `value` and an optional `label`: use it with the exact configuration string to copy. Clipboard failure remains visible until the next attempt; success resets after 1.5 seconds and timers are cleared on unmount.

`ProfitRateDisplay` takes prepared `profitRates` within that provider; its period control cycles daily, weekly, monthly and annual estimates and announces the changed amount. The selected global currency applies throughout all workspaces.

Every holding card also shows its own estimated profit amount and percentage. Each selector starts daily and cycles weekly, monthly, annual and back to daily independently. The same display-currency conversion applies to amounts; percentages stay unchanged. Missing estimates show “Return estimate unavailable”, while known zero rates and negative projections remain visible.

`calculateProductProfitRates(product)` in `src/lib/domain/services/profit-rate-calculator.ts` takes only `currentValueEur` (the complete holding value, including quantity) and `expectedAnnualReturn` (decimal). For example, `calculateProductProfitRates({ currentValueEur: 3650, expectedAnnualReturn: 0.365 })` projects €3.65 / 0.10% daily, €25.55 / 0.70% weekly, €109.50 / 3.00% monthly and €1332.25 / 36.50% annually. It delegates to `calculateProfitRatesSync([product])`, preserving the global formula, 7/30/365-day periods and rounding. Null/non-finite rates or non-positive/non-finite valuations return null without I/O. `ProfitRateDisplay` accepts that null result as well as prepared rates.

Maintenance decision — 2026-10-28: compose the existing period display into each `ProductCard`, keeping local selection independent of the portfolio and other holdings. Keep financial rules in the pure service and accept only the valuation/rate pair (single responsibility and interface segregation). Reuse enriched expected returns, including the existing custom yield/FX combination, without additional market requests. The global aggregate's calculations are unchanged.

Validation: lint/format, production build/TypeScript, all 168 unit tests and all 67 Chromium E2E cases passed. Product estimates are covered for both product types, all periods, unknown/zero/negative rates, total EUR valuation and display-currency changes. Desktop (1440px) and mobile (320px) captures showed no document overflow or JavaScript page errors; keyboard activation and 44px period buttons were checked. Existing workspace-root and Prisma/Turbopack tracing warnings remain.

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

- [Tailwind theme tokens](https://tailwindcss.com/docs/theme)
- [React derived state guidance](https://react.dev/learn/you-might-not-need-an-effect)
- [Next.js server and client components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [shadcn compositional card API](https://ui.shadcn.com/docs/components/card)

## Maintenance notes

Keep diagnostics in the pure domain service and rendering in small components (single responsibility and interface segregation). Do not add fetching to the insight cards or change historical accounting to implement a visual enhancement. The existing UI adapter layer preserves stable callers while the surface system changes (open/closed principle). No dependencies or database schema changes are required.

## Monthly investment gains

Analytics → Overview → Monthly Investment Gains shows monetary gains for completed months: closing portfolio value minus the previous month's closing value minus signed net contributions. For example, a previous close of €1,000, a new close of €1,350, deposits of €500 and withdrawals of −€200 produce a €50 gain. Negative gains remain losses. The tooltip and “View monthly breakdown” expose every term.

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

## Workspace architecture — 2026-10-11

`src/lib/server/portfolio-page-data.ts` exports six focused server loaders. Call `await loadOverviewPage()` for summary/recent history; `await loadHoldingsPage()` for products and rates; `await loadGrowthPage()` for annual history and aligned cost basis; `await loadAllocationPage()` for present-day composition; `await loadCashFlowPage()` for contributions/liquidity; and `await loadRiskPage()` for snapshot-based changes only. These loaders propagate failures to the workspace retry boundary. They do not read MCP credentials.

`loadPortfolioProducts()`, `loadPortfolioHistory(days = 365)`, and `loadDisplayRates()` in `src/lib/server/portfolio-queries.ts` deduplicate reads within a server render with React `cache`; they do not create a global cache of a private portfolio. Product reads use the existing repository and enrichment (including historical EUR-basis backfill). Snapshot grouping uses UTC month keys through `buildSnapshotData(snapshots)`; empty histories remain empty and the chart series retains the latest 90 observations.

`await loadAgentPage()` in `src/lib/server/agent-page-data.ts` resolves authenticated setup details from request headers and configured credentials solely for the integration route. Render its result with `SkillTab`; connection details must never be passed to other workspaces.

`WorkspaceNavigation` and `AnalyticsNavigation` render route links; `DashboardLayout` and `AnalyticsLayout` compose them with server children without data reads. `PageHeading` takes `title`, `description`, and optional `actions`; `CurrencyWorkspace` additionally takes route-specific `rates` and children. Compose currency-aware charts within that provider. `HoldingsPreview` takes sorted products and renders the largest five; mobile amounts use compact notation, while the holdings page shows full amounts. `HoldingsWorkspace` takes products/rates and owns conditional dynamic imports for add, edit, delete, and history dialogs.

`computeReturnDistribution(snapshotValues)` derives histogram bins and descriptive statistics without mutation. For example, pass an ordered ISO-date/value array from `loadPortfolioHistory()`; non-positive prior values skip percentage changes. The caller retains the existing minimum sample requirement. Chart marks disable entrance animation so reduced-motion rendering and initial hydration cannot leave axes without data marks.

`formatDrawdownTick(value)` renders percentage-point axis values with up to two decimals and normalizes negative zero. For example, a -0.25 value renders as -0.25%, keeping shallow decline levels distinguishable. `DailyHeatmapChart` opens its focusable history region at the latest week when the input series changes; arrow keys and horizontal scrolling reveal earlier observations.

Product, contribution, and custom-product actions revalidate `/dashboard` at layout scope. This invalidates every descendant workspace after a write, including previously visited analytics. No dependencies or database schema changes were added.

SOLID: routes and focused loaders have a single responsibility; existing adapters remain composable; small page contracts keep management independent of analytics and credentials. Domain calculations remain independent of presentation and repositories continue to own persistence.

Official references: [Next.js layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages), [Next.js navigation](https://nextjs.org/docs/app/getting-started/linking-and-navigating), [layout revalidation](https://nextjs.org/docs/app/api-reference/functions/revalidatePath), [React render-scoped cache](https://react.dev/reference/react/cache), [Tailwind themes](https://tailwindcss.com/docs/theme).

Validation for this redesign: `bun run lint-format`, 156 unit tests, all 65 production E2E tests, and the production build passed. E2E coverage includes product writes, contributions, history, MCP, authentication, every deep link, display-currency persistence, 320px layouts, and real keyboard browsing of recent heatmap data. The final fallback-only copy removal was rebuilt and the missing-route recovery was checked directly. All fourteen final desktop/mobile workspace captures showed no document overflow or JavaScript page errors. Computed styles confirmed Geist for body/headings and 12px financial surfaces. Every source file stays within 200 lines. The unchanged Prisma/Turbopack file-tracing warning remains.

Maintenance context: the user confirmed the personal portfolio purpose, four principal workspaces, and implementation in code with review of the running app. `PRODUCT.md`, `DESIGN.md`, the design sidecar, and the surface brief retain that context. Keep desktop/mobile calendar history initially positioned at recent observations, preserve decimal tick labels for shallow drawdowns, and keep credentials isolated to the integration page. Synthetic visual fixtures and destructive test cleanup belong exclusively to the disposable test database.

Independent finish review covered the workspace captures and sampled loading, refresh, accounting, and credential boundaries. Its seven findings were resolved; the bounded follow-up validated all fourteen replacement captures and returned `ship`. This verdict covers those fixes and the sampled review scope, rather than certifying every unchanged component.
