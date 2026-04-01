# Preeku — Paper Trading Platform

## Authentication
- **Clerk Auth** is integrated (server-side `@clerk/express`, client-side `@clerk/react`)
- All user-specific API routes (`/api/wallet`, `/api/orders`, `/api/portfolio/*`, `/api/watchlist`) require authentication via `requireAuth` middleware
- **First user to sign up automatically becomes admin** (no manual bootstrap needed)
- Admin can manage users at `/admin` page: view wallets, edit balances, block/unblock users, toggle admin role
- `/api/admin/bootstrap` endpoint allows claiming admin if no admin exists yet (failsafe)

## User Flow
1. Landing page (`/`) shown to unauthenticated users
2. Sign-up (`/sign-up`) / Sign-in (`/sign-in`) via Clerk (email + Google)
3. After auth → redirected to `/dashboard`
4. Sidebar shows Admin link only to users with `isAdmin: true` in `users` table

## Database Schema (multi-user)
- `users` table: `clerkId`, `email`, `name`, `profilePhoto` (TEXT, base64 data URL), `isAdmin`, `isBlocked`
- `wallet` table: has `user_id` column (scoped per user, auto-created on first login)
- `orders`, `positions`, `watchlist` tables: all have `user_id` column
- Legacy data (pre-auth) has `user_id = 'LEGACY'`

## Profile Photos
- Stored as base64 data URLs in `users.profile_photo` column (TEXT)
- Mobile: ImagePicker with `base64: true`, saved via `PATCH /api/user/me`
- Web Admin: file input → FileReader → base64 → `PATCH /api/admin/users/:clerkId/profile`
- Loaded from DB on mobile app startup via `GET /api/user/me`

# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

**Real-Time Price Architecture:**
- `src/angel/smartstream.ts` — Angel One SmartStream WebSocket client; connects to `wss://smartapisocket.angelone.in/smart-stream`, subscribes to 27 NSE tokens in Quote mode (binary parse), emits `tick` EventEmitter events
- `src/angel/priceHub.ts` — WebSocket broadcast server at `/ws/prices`; listens to SmartStream tick events and broadcasts to all connected mobile clients as `{type:"tick",data:PriceTick}` or `{type:"snapshot"}` on connect
- `src/angel/priceSync.ts` — REST fallback every 30s via Angel One Quote API; also emits ticks via SmartStream EventEmitter so priceHub broadcasts REST prices too
- `src/angel/client.ts` — Angel One session management with login mutex (prevents concurrent login races)
- Routing: `/ws` path added to artifact.toml so Replit proxy routes WebSocket connections to API server

- Entry: `src/index.ts` — reads `PORT`, starts Express + HTTP server, creates PriceHub, starts SmartStream
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
