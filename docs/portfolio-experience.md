# Portfolio experience

The dashboard uses a cool glass surface system with Tailwind CSS 4, Geist typography, white edge highlights and translucent panels. Shared card components retain the existing compositional API. Existing HeroUI controls retain their accessible interaction behavior. Reduced-motion preferences disable entry animations; reduced-transparency preferences make glass panels opaque.

## Explore the portfolio

- Charts → Overview shows valuation history, monthly wealth, top performers and invested capital versus value.
- Charts → Allocation groups holdings by product, category and currency and shows contribution to gains.
- Charts → Cash flow shows movements and the configured liquidity curve.
- Charts → Risk shows snapshot changes, rolling changes, drawdowns, distribution and the calendar heatmap. These snapshot-based measures include external cash flows; they are not cash-flow-adjusted returns.
- Products → Search holdings matches name, ticker or native currency. For example, enter “EUR” to find custom euro holdings. Sort holdings offers highest value, highest absolute EUR gain and alphabetical order. Clearing a search restores the full list.
- The global display currency applies to insight amounts as well as existing portfolio values. Percentages remain currency independent.

## Statistics and public module usage

`computePortfolioInsights` in `src/lib/domain/services/portfolio-insights.ts` accepts a readonly list of `InsightHolding` values and returns descriptive diagnostics without side effects. Invoke it with the already enriched EUR portfolio, for example `computePortfolioInsights(productsWithValues)`. Passing an empty list returns null percentages; callers must display missing values rather than imply zero.

`PortfolioInsights` accepts the same list through its `holdings` prop. Render it within `DisplayCurrencyProvider` so liquidity amounts follow the active currency. `ProductsPanel` accepts products and the existing add, edit, delete and history callbacks; `DashboardTabs` composes it with charts and insights.

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
