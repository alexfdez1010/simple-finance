# Data backups

Open **Holdings** and use **Export backup** to download a versioned JSON copy. **Import backup** opens a file picker, validates the entire file and shows its contents before **Replace all data** restores it. Cancel leaves the database untouched. Export the current data first if you want to retain a copy before replacement.

The copy includes every financial product and its source details, all deposits and withdrawals (including notes and historical EUR cost bases), every per-product and portfolio snapshot without a lookback limit, simulation settings including legacy compatibility fields, and the browser's selected display currency. IDs, dates, timestamps, floating-point values and nullable fields are preserved. Import replaces all records rather than merging; an empty collection clears that collection. Repeated imports do not duplicate records.

Passwords, authentication cookies, deployment environment variables and database migration metadata are not financial data and are not included. Keep the JSON file private: it contains the complete financial history in plain text.

The stored history and calculation inputs are restored. Live Yahoo quotes, exchange rates, expected-return estimates and calculations depending on the current date continue to update from their normal sources. A backup does not freeze these external values or the clock.

## API

`GET /api/backup?currency=EUR` downloads an attachment for a signed-in owner. The optional `currency` parameter accepts EUR, USD, BTC, ETH or XAUT and records that browser preference; EUR is the default. For example, a same-origin authenticated browser request to `/api/backup?currency=USD` downloads the full copy with USD selected. Responses use `Cache-Control: no-store`.

`POST /api/backup` accepts the exported JSON as its entire request body, with `Content-Type: application/json`, the existing session cookie and an `Origin` matching the app URL. For example, submit the unchanged downloaded object using a same-origin browser POST, then refresh dashboard data and apply the returned `preferences.displayCurrency`. The response is `{ "success": true, "preferences": { "displayCurrency": "EUR" } }` on success. Both routes return 401 without a valid session; POST returns 403 for foreign or absent origins, 400 for invalid copies and 500 for a failed transaction.

Version 1 requires `format: "simple-finance-backup"`, `version: 1`, an ISO millisecond `exportedAt`, `preferences.displayCurrency` and all seven collections in `data`: `products`, `yahoo`, `custom`, `contributions`, `productSnapshots`, `portfolioSnapshots` and `runwaySettings`. Unknown fields/versions, missing collections, invalid dates, duplicate keys and orphaned or mismatched product details are rejected. Snapshot dates must be UTC midnight to preserve existing date values. Files are limited to 20 MiB in the browser and server, including streamed request bodies. Hosting providers may impose a smaller request/response limit.

Export reads all seven financial tables in one consistent D1 batch. Import validates before mutation and replaces records in dependency order within one atomic D1 batch. Accounts, sessions and OAuth credentials are excluded and survive restoration. Any failed database write rolls back the whole replacement. The dashboard cache is invalidated only after the transaction commits. A lost network response leaves the outcome uncertain; export the data to check before retrying.

## Validation

Unit tests cover the portable schema, referential integrity, request authentication/origin, size limits and preview/cancel/restore state. `tests/e2e/backup.spec.ts` covers an exact round trip of every record type, repeat imports, invalid input, empty restoration, browser download/import, mobile layout and real database rollback after an injected final-write failure. Run it against a dedicated test database because the suite replaces its contents.

Implementation references: [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route), [Prisma transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions), [Zod schemas](https://zod.dev/api), [HeroUI AlertDialog](https://heroui.com/en/docs/react/components/alert-dialog).
