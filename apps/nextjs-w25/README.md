## Overview

`nextjs-w25` is the Bildstein | Glatz web platform built on the **Next.js 15 App Router** stack. It combines structured content from **Sanity**, relational data via **Prisma**, and password-based access powered by **NextAuth**. The UI is implemented with **React 19** components, **Tailwind CSS v4**, and a series of custom modules for artwork navigation, PDF exports, and dominant-color tooling.

- PDF proof generation (`src/components/PdfDownloadButton.tsx`) using `jspdf` and custom Owners Text fonts.
- Color intelligence pipeline (Next.js API route + scripts) that keeps artwork metadata aligned with Sanity content.
- Credential-based dashboard login with Prisma-backed users.

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 15 App Router, React 19, Turbopack dev server |
| Styling | Tailwind CSS v4, PostCSS 8 |
| Auth | NextAuth Credentials provider + bcrypt password hashing |
| Utilities | node-vibrant, jsPDF, custom scripts under `/scripts` |

- npm (bundled with Node) or pnpm/yarn
- Access to the Sanity project (`projectId: yh2vvooq`, dataset `production`)
- Access to the Prisma database

## Environment variables

Create `.env.local` (used by Next.js) plus `.env` for Prisma if you prefer. The minimum variables are:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Connection string for Prisma (e.g., Postgres on Supabase/Railway). Used automatically during `npm run build` via `prisma generate`. |
| `NEXTAUTH_SECRET` | ✅ | Random string used to sign NextAuth JWT/session cookies. |
| `NEXTAUTH_URL` | ✅ in production | Public base URL for NextAuth callbacks (e.g., `https://w25.app`). |
| `SANITY_API_TOKEN` | ✅ for scripts/webhooks | Sanity token with `editor` privileges. Consumed by `/app/api/dominant-color`, `scripts/extract-dominant-colors.mjs`, and preview clients. |
| `SANITY_WEBHOOK_SECRET` | ✅ when webhook enabled | Shared secret used by `/api/dominant-color` to verify Sanity webhooks. |

> Tip: When running locally you can set `NEXTAUTH_URL=http://localhost:3000`.

## Installation & local development

```bash
npm install
npm run dev
```

The site will be available at `http://localhost:3000`. Turbopack hot reload is enabled by default (`next dev --turbopack`).

Useful scripts:

- `npm run dev` / `npm run dev:turbopack` – Default dev server using Turbopack for fastest refresh.
- `npm run dev:webpack` – Opt-in legacy webpack dev server when investigating compatibility issues.
- `npm run build` – Runs Prisma codegen (if `schema.prisma` is present) and produces the production Next.js build.
- `npm run build:profile` – Builds with React profiling instrumentation enabled.
- `npm run start` – Serves the production build.
- `npm run lint` – Runs `next lint` using the repo ESLint configuration.
- `npm test` – Executes the Playwright end-to-end suite (see below).
- `npm run metrics:bundle` – Runs a production build and writes `docs/bundle-metrics.json`, failing the process if `/pdf-test` or `/new-work` exceed their size budgets.

## Testing & QA

The repository ships with a lightweight [Playwright](https://playwright.dev/) setup that boots the Next.js dev server automatically and asserts the most critical flows:

- `/` ➝ `/new-work` redirect and navigation shell
- `/login` + `/register` form rendering
- `/pdf-test` downloading a PDF from `PdfGenerator`

Run the suite locally:

```bash
npx playwright install   # first run only, downloads browser binaries
npm test
```

Optional helpers:

- `npm run test:ui` – launches the Playwright UI runner
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4000 npm test` – point tests at an already-running dev server

### CI integration

Add these steps to your pipeline (GitHub Actions, Vercel checks, etc.):

```bash
npm ci
npx playwright install --with-deps
npm run lint
npm test
```

The Playwright config automatically reuses an existing dev server locally and starts one inside CI, so no extra orchestration is required beyond exporting the same env vars you use for `npm run dev`.

## Performance & profiling

- Switch dev servers with `npm run dev:turbopack` (default) or `npm run dev:webpack` to mirror legacy webpack behavior.
- Build with `npm run build:profile` followed by `npm start` to capture React profiler traces on `/pdf-test` or `/new-work/[slug]`.
- Run `npm run metrics:bundle` after feature work to rebuild, log chunk sizes for `/pdf-test` and `/new-work`, and ensure their unique bundles stay under budget. Results are committed to `docs/bundle-metrics.json`.
- See `docs/perf.md` for deeper instructions and workflows.

Latest bundle snapshot (`npm run build`, 22 Nov 2025):

| Route | Size | First Load JS | Notes |
| --- | --- | --- | --- |
| `/pdf-test` | 1.44 kB | 287 kB | Static harness for `PdfGenerator`; `jspdf` drives the first-load payload. |
| `/new-work/[slug]` | 4.08 kB | 293 kB | Artwork detail view that shares the same PDF bundle. |

## Scripts directory

### `scripts/extract-dominant-colors.mjs`

Backfills `mainImageWithColor.dominantColor`/`dominantHue` fields in Sanity by analyzing artwork images with `node-vibrant`.

```bash
SANITY_API_TOKEN=... node scripts/extract-dominant-colors.mjs --limit 200 --concurrency 4
```

Flags:

- `--limit` (`-l`): number of artworks to process (default 500)
- `--concurrency` (`-c`): number of parallel workers (default 1)
- `--dry-run` (`-d`): log actions without patching Sanity

### `scripts/print-register-webhook.sh`

Prints a ready-to-run `curl` command for registering the Sanity webhook that triggers `/api/dominant-color`.

```bash
./scripts/print-register-webhook.sh
# Follow the instructions to replace <PROJECT_ID>, <TOKEN>, and deployment URL
```

Pair this with `SANITY_WEBHOOK_SECRET` and deploy URL so the Next.js API route can authenticate webhook calls.

## Running Sanity + Prisma

The Studio for this project is maintained separately (see the `/schemas` directory for the canonical schema files). To edit schema or run a local studio:

```bash
cd sanity
npm install
npm run dev
```

Prisma expects a `schema.prisma` file at the repo root or under `/prisma`. Whenever you change the schema, run:

```bash
npx prisma migrate dev
npx prisma generate
```

## Deployment notes

- The project is optimized for Vercel but can run on any Node 20+ host.
- Ensure all environment variables above are set on the hosting provider (Vercel, Render, etc.).
- If you rely on the dominant-color webhook, register it against the production URL after each deploy.

## Troubleshooting

- **Auth fails locally**: confirm `NEXTAUTH_URL=http://localhost:3000` and `NEXTAUTH_SECRET` are set.
- **Dominant color extraction fails**: make sure `SANITY_API_TOKEN` has `write` permissions and that image assets are reachable.
- **Prisma errors on build**: verify `DATABASE_URL` points to a live database; `npm run build` will fail if Prisma cannot connect.

For additional help, check the relevant vendor docs (Next.js, Sanity, Prisma, NextAuth) or reach out to the Bildstein | Glatz engineering team.
