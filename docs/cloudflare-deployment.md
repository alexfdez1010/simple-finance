# Cloudflare deployment and account access

Simple Finance runs on Cloudflare Workers with OpenNext, D1 SQLite and KV for Next.js market-data caching. Production is `https://finance.alejandrofernandezcamello.me`. D1 database `simple-finance` is in Western Europe. The Worker, database and cache bindings live in `wrangler.jsonc`.

## Local development

Run `bun install`, copy `.env.example` to `.env` and `.dev.vars`, and replace the example secrets with random values of at least 32 characters. Keep `DATABASE_URL=file:./local.sqlite` for Prisma schema tools; runtime data uses the `DB` binding. Set the local `BETTER_AUTH_URL` to `http://localhost:3000`.

Run `bun run database` to apply SQLite migrations locally, then `bun run dev`. No PostgreSQL or Docker is required. Local data is stored in `.wrangler/state`. `bun run cf-typegen` updates binding declarations without polluting browser DOM types with Worker runtime globals.

`bun run lint-format`, `bunx tsc --noEmit`, `bun run test:unit` and `bun run test:e2e` validate the source. `bun run test:worker` builds and tests the actual Cloudflare runtime. E2E tests replace local financial data and provision a known test owner, so use a dedicated local environment. Fixture clients query the running Worker through Wrangler’s localhost-only D1 explorer API, using the same database instance without concurrent emulators or native SQLite addons in the browser test runner. E2E commands start a built Worker preview.

## Account access

On an empty installation, `/auth` shows name, email and password fields. The password must contain at least 12 characters. The first successful registration creates the sole owner. A database trigger atomically creates a permanent claim and rejects every later account, including concurrent first-registration attempts. The claim is independent of the user row and financial backups, so deleting an account or importing an empty portfolio cannot reopen registration.

Afterward `/auth` only shows sign-in. Better Auth stores passwords as password hashes and issues signed HttpOnly session cookies backed by D1, with a 30-day lifetime. Sign out revokes the current session. Production login and OAuth routes use persistent database rate limits. The previous `PASSWORD`, shared SHA-256 cookie and MCP bearer secret are no longer accepted.

The first production account belongs to the person who registers it. Deployment does not create an account on the owner's behalf. Keep the owner email and password in your password manager. There is no email password-reset provider configured.

## MCP OAuth

Connect an assistant to `https://finance.alejandrofernandezcamello.me/api/mcp/mcp` using OAuth. Anonymous requests return 401 with protected-resource discovery metadata. Dynamic client registration permits native loopback callbacks and browser clients. Public clients must use the authorization-code grant with S256 PKCE, sign in using the owner's account and approve portfolio access on `/consent`.

Discovery is available at `/.well-known/oauth-protected-resource/api/mcp/mcp` and `/.well-known/oauth-authorization-server/api/auth`. Better Auth handles client registration, signed authorization requests, consent, single-use authorization codes, refresh tokens, revocation and signing keys. The MCP boundary verifies signature, issuer, resource audience, expiry and `assets:rw`. An identity-only token cannot access the portfolio. Client credentials are disabled.

`getAuth(database?, canRegister?)` composes the auth server with injectable storage and registration policy for isolated tests; normal requests use the native D1 adapter. `registrationOpen()` reads the permanent claim. `isAuthenticated()` validates the current browser session; `requireAuthentication()` rejects direct anonymous server actions. `safeRedirect(value)` preserves local destinations and rejects external redirects. The client `authClient` provides sign-in, sign-up, sign-out and OAuth consent methods.

Agent setup and `/api/skill?kind=config` provide an HTTP MCP configuration containing the server URL without credentials. Select OAuth authentication in the assistant and complete its browser flow. `/api/skill?kind=skill` downloads the tool guide. Existing connections using a static token must reconnect with OAuth.

## Daily capture

The Cloudflare cron remains `0 5 * * *`, meaning 05:00 UTC daily: 06:00 in mainland Spain during winter and 07:00 during summer. The custom Worker's `scheduled()` handler invokes the existing capture route through OpenNext with `CRON_SECRET`. Non-success responses fail the invocation visibly in Cloudflare observability. Dates are normalized to UTC midnight. Snapshot upserts make repeated captures for one date idempotent; missing Yahoo quotes skip the capture.

For a manual capture, call `GET /api/cron/snapshot` with `Authorization: Bearer <CRON_SECRET>`. Calls without a matching secret return 401. For local scheduler verification, run `bunx wrangler dev --port 3000 --test-scheduled --infer-origin-from-routes=false`, then request `/cdn-cgi/handler/scheduled`.

## Deployment commands

`createYahooClient()` creates a fresh Yahoo Finance client for each operation so its cookie and crumb requests cannot leak I/O objects across Worker requests. Completed market-data values remain cached in KV.

Run `bun run database:deploy` to apply the versioned D1 migrations remotely, then `bun run deploy` to build and deploy the Worker. For the initial deployment, supply production `BETTER_AUTH_SECRET` and `CRON_SECRET` as JSON through `wrangler secret bulk` on stdin. These secrets must remain stable across subsequent deployments. Upload the exact JSON values, because dotenv secret-file uploads can be overridden by local process environment variables. Ordinary later deploys preserve the saved secrets. `BETTER_AUTH_URL` is the canonical HTTPS origin in `wrangler.jsonc`; do not derive the issuer from client-supplied Host headers.

`bun run build:cloudflare` produces `.open-next`. `bun run preview` builds and starts the Worker runtime locally. Local previews preserve the localhost origin with `--infer-origin-from-routes=false`, so the production custom domain does not rewrite local authentication Origin headers. The custom domain belongs to this Worker; Cloudflare manages its certificate and routing. The public Worker development hostname is secondary and is not an additional OAuth issuer.

Vercel's cron must be disabled when the Cloudflare schedule is enabled. Its previous deployment and PostgreSQL database can remain as rollback resources; do not delete them during the cutover. `vercel.json` disables future Vercel Git builds and declares no cron jobs.

## Data and rollback

Production D1 starts without financial records. Import the previously exported version 1 JSON from Holdings. Accounts, sessions and OAuth credentials are excluded from financial backups. Export reads the financial tables in one D1 batch; restore validates all records first, then replaces them in one atomic batch. A failing final statement rolls back the earlier deletes and writes. Bound JSON inserts avoid D1's SQL parameter limit for long histories.

Before a later rollback, export any new D1 financial data. Restore the previous Vercel CNAME target `85f2c0196be3957e.vercel-dns-017.com` and re-enable its cron only after disabling the Cloudflare schedule. Auth sessions and OAuth grants do not transfer to the old password-based app. Existing PostgreSQL migrations are retained under `prisma/migrations` for the previous deployment; only `migrations/` contains the D1 migration history.

## Official references

[Better Auth Next.js integration](https://better-auth.com/docs/integrations/next), [Better Auth MCP](https://better-auth.com/docs/plugins/mcp), [OAuth provider](https://better-auth.com/docs/plugins/oauth-provider), [OpenNext setup](https://opennext.js.org/cloudflare/get-started), [custom Workers](https://opennext.js.org/cloudflare/howtos/custom-worker), [Prisma D1](https://www.prisma.io/docs/orm/v6/overview/databases/cloudflare-d1) and [D1 atomic batches](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch).

## Cutover verification

On 2026-11-01, ESLint/formatting, TypeScript, 332 unit cases and all 86 Chromium end-to-end cases passed against the built Worker. Verification includes registration races, permanent registration closure, browser sessions, OAuth login and consent, PKCE, refresh and code replay, insufficient scopes, all financial workflows, atomic backup rollback, UTC snapshots, keyboard access and narrow layouts. The domain was inspected in Safari, and the production capture route returned 200. The previous Vercel cron is disabled; the old DNS target remains under `finance-vercel-rollback` for rollback.
