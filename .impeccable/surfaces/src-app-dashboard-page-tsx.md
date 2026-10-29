---
version: 1
slug: 'src-app-dashboard-page-tsx'
primary_target: 'src/app/dashboard/page.tsx'
related_targets:
  [
    'src/app/dashboard/layout.tsx',
    'src/app/dashboard/portfolio/page.tsx',
    'src/app/dashboard/analytics/page.tsx',
    'src/app/dashboard/skill/page.tsx',
    'src/app/auth/page.tsx',
  ]
---

# Portfolio workspace redesign

Mode: Operate. The user authorized a wholesale visual and interaction redesign, delegated the design choices, and requested review of the running application followed by a verified push to main. This replaces the earlier forest notebook direction and its exploratory board. The user retains a personal English-language portfolio with Home, Holdings, Analytics, and Agent setup destinations. Preserve existing valuation definitions, projections, contributions, password protection, CRUD, history, and route-specific server loading.

## Direction contract

THESIS: Precision, in perspective. Give the present balance a clear visual anchor, then make performance, composition, and individual positions easy to inspect.

OWN-WORLD: Aluminum ground, softly elevated white surfaces, graphite type, a precise blue interaction accent, and a dark graphite balance panel. Geist carries the hierarchy and tabular values. Surface corners are 16px and control corners 12px; depth is restrained and tied to surface or interaction level. The only translucent application chrome is the mobile dock. No raster assets or added dependencies are needed.

COPY AND IDENTITY: Follow the permanent product-wide rule: no final full stops or decorative dot separators in titles/subtitles, and no decorative dots in brands. Selection uses fill and icon weight without a decorative active-route dot. Authentication keeps orbital rings without a decorative point. Functional chart/category markers and user-supplied instrument names/symbols are preserved. Any temporary synthetic review holding is explicitly marked “(demo)”.

STORY: Read the valuation first; compare invested capital, return, latest snapshot change, and projected profit; inspect evolution and category composition; continue into holdings or detailed analytics through real links. Agent credentials and setup stay on their own route.

FIRST VIEWPORT: On a wide desktop, a fixed 240px white rail frames a workspace heading, display-currency control, and Manage holdings action. The summary pairs a dark balance panel with supporting figures and forecast at a 1:1.45 ratio. The next row pairs the blue evolution area and category ring/ledger at a 1.7:1 ratio. The largest-five-holdings table, diagnostics, and analytics link continue below. This composition starts at 1280px; narrower screens stack the summary and charts.

FORM: The desktop content container is at most 1480px with 16px, 32px, and 48px responsive gutters. Below 1024px, a top identity and fixed four-destination bottom dock replace the rail. The dock sits 12px from the sides and at the larger of 12px or the safe-area bottom; main content reserves 104px plus that safe area. Navigation targets are at least 48px high, and primary route actions are at least 44px. Mobile holdings previews use compact amounts; full holding management retains complete values. Long names, values, and controls wrap without increasing the document width.

MOTION: Native CSS provides a single 1100ms balance-light sweep, a 750ms chart-container reveal, a 420/560ms route sequence with capped delays, a 260ms currency-value settle, a 340ms selected-icon settle, and a 900ms authentication orbit settle. Content-entry effects do not loop. Hover/press feedback remains brief. Recharts marks have animation disabled. Reduced motion reveals unclipped charts and suppresses transitions and lift; reduced transparency makes the dock opaque. Dialog closure restores the opener, with a focusable workspace fallback when deletion removed it.

TRUTH: Evolution ranges are 30, 60, or 90 observations labelled “pts”, never implied calendar days. Chart values use supplied portfolio history and currency formatting. A single observation remains visible. Category colors correspond to persisted categories; the ring only renders for positive totals with nonnegative values. Signed or zero valuations retain the ledger and explain unavailable shares. Empty holdings/history states explain how real data appears. Unknown snapshot changes remain unavailable. Review fixtures are explicitly named demo data and run exclusively in a disposable database.

FINISH: Record the implemented system in DESIGN.md and the schema-v2 sidecar, then review desktop/mobile flows, reduced-motion behavior, keyboard focus, real chart marks, and data boundaries. Current-run verification belongs in docs/portfolio-experience.md once completed; older validation entries remain historical. A successful finish review and required lint, unit, build, and isolated E2E checks precede the authorized push.
