# Portfolio experience

The dashboard uses a cool glass surface system with Tailwind CSS 4, Geist typography, white edge highlights and translucent panels. Shared card components retain the existing compositional API. Existing HeroUI controls retain their accessible interaction behavior. Reduced-motion preferences disable entry animations; reduced-transparency preferences make glass panels opaque.

## Explore the portfolio

- Charts → Overview shows valuation history, monthly wealth, top performers and invested capital versus value.
- Charts → Allocation groups holdings by product, category and currency and shows contribution to gains.
- Charts → Cash flow shows movements and the configured liquidity curve.
- Charts → Risk shows cash-flow-adjusted changes, rolling returns, drawdowns, distribution and the calendar heatmap. Click or keyboard-activate a populated heatmap day to open its date and signed percentage return; Escape or clicking outside closes the popover. Zero-return days remain available.
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

## Cash-flow-adjusted risk calculations

`computePortfolioRisk` in `src/lib/domain/services/portfolio-risk.ts` accepts chronological EUR valuations and cumulative EUR contributions aligned by ISO date. Invoke `computePortfolioRisk(snapshotData.riskValuations, investedSeries)` to obtain adjusted EUR `dailyChanges` and a base-100 `performance` index. For example, a portfolio moving from EUR 100 to EUR 160 after a EUR 50 deposit reports EUR 10 profit and a 10% return. If it then rises to EUR 176 without contributions, the next return is 10% and the compounded index is 121.

Each interval subtracts its change in cumulative contributions from its change in valuation. Returns divide this adjusted gain by opening portfolio value and compound geometrically. All Risk charts use this shared calculation; Overview continues to show actual wealth. The calculation uses up to 365 days of snapshots and the existing contribution ledger, including custom deposits/withdrawals at their stored EUR basis and Yahoo purchases. Missing contribution bases throw an error. Empty histories stay empty, single snapshots establish a baseline, and intervals without positive opening capital leave the index unchanged. Daily data assumes end-of-period flows; gaps represent returns between available snapshots, and intraday timing cannot be reconstructed. Deleted or backdated holdings/movements can limit accuracy against previously stored snapshots.

`DailyHeatmapDay` accepts a `cell` containing an ISO date and percentage (or null), plus `maxAbs` for color intensity. For example, render it with `cell={{ date: '2026-09-02', pct: 10 }}` and `maxAbs={10}` to show a clickable +10.00% day. Null returns render noninteractive placeholders. The component uses the existing HeroUI popover for focus, keyboard and dismissal behavior.

References: [React memoization](https://react.dev/reference/react/useMemo), [HeroUI Popover](https://heroui.com/en/docs/react/components/popover), [GIPS return calculation standards](https://www.gipsstandards.org/wp-content/uploads/2021/03/2020_gips_standards_firms.pdf), and [Vitest](https://vitest.dev/guide/).
