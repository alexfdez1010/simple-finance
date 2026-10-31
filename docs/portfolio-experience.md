# Portfolio experience

The application uses aluminum ground, softly elevated white surfaces, graphite typography, blue controls, and a prominent dark balance panel. Geist and tabular numerals give portfolio figures a consistent hierarchy. Tailwind CSS 4 supplies tokens and responsive layouts; existing HeroUI adapters preserve control contracts. Native CSS adds bounded entry and state feedback while Recharts mark animation stays disabled. DESIGN.md describes the current visual system; dated validation and maintenance entries below describe their original changes.

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

## Visual and interaction system — 2026-10-29

The user authorized the complete redesign and delegated its design choices. “Precision, in perspective” replaces the earlier forest notebook world with an aluminum/white/graphite palette, blue actions, a dark valuation panel, and a deliberate value hierarchy. This change preserves existing accounting, projections, product behavior, authentication, and independent route loaders. No dependencies, database schema changes, raster assets, or production fixture data are introduced.

The desktop rail is 240px wide; the content max-width is 1480px. Below 1024px, navigation becomes a bottom dock with safe-area positioning and matching main-content clearance. Cards use 16px corners, controls use 12px, and shared card insets grow from 20px to 24px at 640px. HeroUI derives the extra-large and double-extra-large radii from the base, so the base remains 8px to emit the intended 12px and 16px values. The input adapter explicitly uses the control radius.

The overview composes a balance panel, supporting capital/return/latest-change figures, projections, blue evolution area, category ring with complete ledger, largest-holdings table, and diagnostics. Allocation keeps signed and zero valuations visible in its ledger and omits unavailable percentages and the ring. Evolution controls still select observations rather than calendar intervals. Empty states explain the missing source data without illustrative portfolio values.

Motion is implemented in src/app/styles/motion.css and the shared component styles. Route entry, bounded list delays, currency-value settle, selected-navigation feedback, chart-container reveal, authentication geometry, and a single balance-light sweep provide orientation. Recharts mark animation remains off. Reduced-motion preferences suppress movement and clipping, and reduced-transparency preferences make the mobile dock opaque. Dialog closure restores the opening control; if a successful deletion removes it, focus returns to the focusable main workspace. Pending and failed writes retain the active dialog's focus.

Public usage: `PortfolioEvolutionPlot` in src/components/dashboard/portfolio-evolution-plot.tsx takes chronological `{ date, value }` EUR observations through `data`, within `DisplayCurrencyProvider`. For example, render `<PortfolioEvolutionPlot data={recentSnapshots} />` after the parent has selected a nonempty range. It owns only rendering, uses a unique gradient ID per instance, and keeps a single observation visible. `PortfolioEvolutionChart` owns the empty state and range controls; no new data fetching belongs in the plot.

`HoldingIdentity` in src/components/products/holding-identity.tsx accepts one persisted `AssetCategory`: for example, `<HoldingIdentity category={product.assetCategory} />`. Its category icon is decorative and must accompany the holding name or category text. It performs no company-logo lookup, network request, or state change.

`AuthBrand` in src/components/auth/auth-brand.tsx has no props: compose `<AuthBrand />` beside the existing password form. It renders truthful product context and decorative orbital geometry, is hidden below the large breakpoint, and performs no authentication. The form retains submission, validation, pending, error, and redirect responsibilities.

`useDialogFocus(isOpen)` in src/components/workspace/use-dialog-focus.ts returns a generic opener adapter. For example, derive whether any management dialog is mounted, call `const openDialog = useDialogFocus(isDialogOpen)`, and use `openDialog(setEditTarget, product)` from the edit control. The adapter captures the active opener before invoking the supplied setter; closing the final dialog restores that control on the next animation frame, with cleanup cancelling stale work. A removed opener falls back to `main-content` without scrolling. The hook coordinates focus only and leaves domain mutations and selected-product state with the workspace.

`formatInCurrency` retains its EUR conversion and display-currency contract. For example, `formatInCurrency(valueEur, 'USD', usdRate, { compact: true })` renders a compact amount. Compact output now joins localized numeric parts with explicit compact-unit and currency spacing so server/browser Intl differences cannot change the initial text. This affects presentation only; precision and financial calculations retain their existing policies.

SOLID decisions: the chart parent owns range/empty-state logic and the plot owns chart rendering; holding identity and authentication branding are pure presentation. A focused generic focus hook composes with lazy dialogs without taking over their state or writes. Existing HeroUI adapters retain stable caller contracts while theme tokens change. Domain services and route-specific loaders remain independent of the visual system.

Build-root decision: Next.js `turbopack.root` is explicitly the project directory so a parent-directory lockfile cannot change module/CSS resolution. This is a development/build boundary, with no new runtime data access.

Validation on 2026-10-29: `bun run lint-format`, TypeScript checking, the production build, all 207 unit tests, and all 72 Chromium E2E tests passed. The final visual corrections were additionally checked by 17 focused E2E cases; the last three subtitle/legend copy corrections passed a further six keyboard, form, and history E2E cases. The final production capture set contains 32 desktop/mobile images, including 320px oversized values, empty states, dialogs, history, and keyboard focus, with loaded fonts and no document overflow, page errors, console warnings, or running animations. Review data is explicitly labelled `(demo)` and exists only in the isolated local test database. Static captures and Chromium checks do not certify Safari or screen-reader behavior.

Official implementation references: [Tailwind theme variables](https://tailwindcss.com/docs/theme), [Tailwind responsive utilities](https://tailwindcss.com/docs/responsive-design), [React useId](https://react.dev/reference/react/useId), [React effect cleanup](https://react.dev/reference/react/useEffect), [Next.js Turbopack configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack), [Recharts Area](https://recharts.github.io/en-US/api/Area/), [Recharts Pie](https://recharts.github.io/en-US/api/Pie/), [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [safe-area environment variables](https://developer.mozilla.org/en-US/docs/Web/CSS/env).

Maintenance safeguards: HeroUI `--muted` is a text color; use `bg-surface-secondary` for explanatory form panels so muted text retains contrast. Keep the balance light sweep inside an inset-zero pseudo-element and move its background rather than extending its geometry. Category labels must wrap independently of amounts at 320px. Authored titles, subtitles, and brands have no terminal periods or decorative dot separators; financial symbols, decimal notation, meaningful chart markers, and original instrument names retain their meaning.

## Usability refinement — 2026-10-31

Design-craft review retained the existing aluminum, graphite, Geist, and blue identity. The confirmed issues were duplicated card insets, wrapped evolution-axis currency units, and narrow mobile metric columns. The shared card adapter now resets its outer padding and gap, leaving its existing header/content adapters responsible for the documented 20/24px insets. The evolution plot reserves 82px for its value axis.

The overview gives the balance more width at desktop sizes and aligns supporting amounts on the right in mobile rows. The balance return states its all-time period, the holding count handles the singular, and projections and their assumption text share a muted surface. The estimate display uses natural height so it cannot consume the space reserved for that explanation. Its independent period cycling and currency conversion remain unchanged. Skeletons mirror the revised arrangement. Navigation omits the duplicate analytics promotion, and the empty holdings link explicitly invites adding the first holding.

SOLID decisions: correct repeated spacing in the shared presentation adapter rather than individual charts; keep responsive composition in the summary and financial calculations in existing services. Preserve component prop contracts, routes, local selection, authentication, and data loading. No packages, schema changes, or production demonstration data were introduced. Review fixtures live only in the isolated `finance_design_review` database.

Validation: `bun run lint-format`, all 208 unit tests, and the production build with TypeScript passed. All 72 Chromium E2E scenarios were verified: 71 passed in the full run, then the layout test was updated from the previous two-column mobile expectation to full-width rows and passed in a focused rerun. It also checks that the projection explanation remains inside its surface. Production screenshots at 390, 768, and 1440px showed no document overflow or JavaScript page errors. Existing build output includes a Prisma/Turbopack file-tracing warning; isolated dialog unit tests emit React Aria press-responder warnings. Neither caused a check failure. Chromium verification does not certify Safari or screen-reader behavior.

## Motion and owned imagery refinement on 2026-10-31

The existing graphite, aluminum, and blue direction now includes an original physical-folio illustration on the authentication screen and in first-holding states. It is decorative, delivered locally through Next Image with reserved dimensions, and never stands in for portfolio data. The source prompt, asset path, and `PortfolioArtwork` invocation examples are recorded in [visual assets](visual-assets.md). Holding identities use distinct Phosphor duotone shapes and category tones consistent with allocation charts.

Navigation keeps one selection surface mounted while the active destination changes. `useNavigationIndicator(pathname)` from `@/components/workspace/use-navigation-indicator` returns a nav ref: attach it to a positioned `.navigation-track` containing a decorative `.navigation-indicator` and links with `aria-current="page"`. The hook observes container/link resizing and loaded fonts, releases observers/listeners on unmount, and retains selected-link backgrounds when measurements are unavailable. Route changes retarget an interruptible CSS transition; layout changes snap to the new bounds before transitions are reenabled. Reduced motion keeps selection immediate.

The workspace heading has a short entrance while portfolio data and holding rows remain immediately visible. Currency and projected-period changes use a brief opacity/position settle without blur or counting through fictitious amounts. Only the evolution series reveals; axes remain stationary and readable. Animation styles are split by responsibility across `motion.css`, `navigation.css`, `dialogs.css`, and `illustrations.css`.

`HoldingsWorkspace` retains the last dialog descriptor after closing and passes `open={false}` to HeroUI, allowing its real exit lifecycle to finish. A fresh session key resets form state when reopened; history requests stop when closed, and successful writes close only after confirmation. The focused `useDialogFocus` adapter remains responsible for focus recovery. Dialogs use a restrained entrance and shorter exit, and familiar asset-type icons distinguish the add form's two tabs.

Official references consulted: [Next Image](https://nextjs.org/docs/app/api-reference/components/image), [React effect cleanup](https://react.dev/reference/react/useEffect), [Tailwind transitions](https://tailwindcss.com/docs/transition-property), [HeroUI Modal](https://heroui.com/en/docs/react/components/modal), [Phosphor React](https://github.com/phosphor-icons/react), and [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).

Validation on 2026-10-31: `bun run lint-format`, production compilation and TypeScript checking pass; all 220 unit tests and 75 Chromium E2E cases pass. After the final compact-tab spacing adjustment, all 14 affected form, keyboard, reduced-motion, and navigation E2E cases passed again against the rebuilt production server. The suite used a separate local PostgreSQL container on port 5442, leaving the existing portfolio database untouched. Seventeen final captures cover authentication, empty states, populated demo portfolios, currency/period switching, and dialogs at representative widths from 320px to 1440px. Loaded fonts/media, document bounds, and browser errors were checked; there were no overflows or browser warnings/errors in the capture run. Evidence is kept locally under `.impeccable/review/2026-10-31-motion/` and is excluded from version control. The production build reports a Prisma file-tracing warning; compilation still succeeds. Chromium verification does not establish Safari behavior or sustained hardware performance.

Maintainer note: translating a full-width pseudo-element can expand a panel's `scrollWidth` even with `overflow: hidden`. Keep the bounded balance-light sweep within its background. Responsive indicator snaps must stay transition-free for a painted frame before rearming; interrupted route transitions should still retarget from their current visible position. Real frame samples confirm continuity and zero indicator drift during the verified mobile-to-desktop change, and server-rendered selected backgrounds remain available without JavaScript.
