# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Confirmed by the user: a personal tool for reviewing wealth, managing investments, and consulting portfolio evolution. Broader audiences are undecided.

## Product Purpose

Track holdings and portfolio performance. The requested home dashboard brings together the current balance, growth, allocation, and access to management; each principal workspace has its own route and data loading.

## Capabilities and Constraints

Repository evidence: Yahoo Finance positions, custom investments with signed contributions, historical EUR cost basis, portfolio and product snapshots, liquidity horizons, forecasts, five display currencies, password authentication, and authenticated MCP/skill integration. Preserve these capabilities and existing financial definitions. Do not fabricate balances or market returns.

The project uses Next.js App Router, React, TypeScript, Tailwind CSS 4, Prisma, HeroUI-based existing component adapters, and Recharts. Keep files below 200 lines and verify lint, formatting, unit and end-to-end behavior before pushing to main.

## Operating Context

Repeated private portfolio review; desktop/mobile usage is inferred from the existing responsive app. The user explicitly requested a full layout redesign, dedicated pages, lighter route-specific loads, and a verified push to main. On 2026-10-29, the user authorized a complete visual and interaction redesign using the agent's design judgment, with polished animation and review of the running application before the push.

## Brand Commitments

Existing product name: Simple Finance. Existing interface language: English.

Permanent user commitment: titles and subtitles have no final full stops or decorative dot separators, and brand compositions have no decorative dots. This applies across the interface, including authentication, navigation, headings, and card descriptions. Functional chart/category markers remain meaningful data symbols; user-supplied instrument names and symbols retain their original text.

## Evidence on Hand

Working implementation, README.md, docs/portfolio-experience.md, domain services, and deterministic tests. Financial values come from stored holdings and market providers. Review fixture values must be identified as synthetic.

## Product Principles

- Put the overall portfolio perspective on the landing dashboard.
- Give management, analytics, and agent integration independent destinations.
- Load and serialize only what the current workspace needs.
- Preserve financial meaning and honest unavailable-data states.

## Open Decisions

The user confirmed the organization into Home, Holdings, Analytics, and Agent integration and requested implementation in code followed by review of the running app. English copy is retained. The current redesign delegates visual decisions to the agent without a design interview; this task-specific authorization does not establish a standing workflow preference. Broader audiences remain undecided.
