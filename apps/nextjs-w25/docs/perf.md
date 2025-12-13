# Performance & profiling guide

This note covers how to switch between Turbopack and webpack during development, how to profile bundles and React rendering, and the current bundle-size numbers for the PDF-heavy routes.

## Dev server switch

| Command | Description |
| --- | --- |
| `npm run dev` / `npm run dev:turbopack` | Launches `next dev --turbopack` for the fastest refresh cycle. Ideal for day-to-day UI work. |
| `npm run dev:webpack` | Forces the legacy webpack dev server (`next dev`). Use this when validating plugin compatibility or when Turbopack hits an unknown edge case. |

Both commands respect `.env.local`. You can pass additional flags via `npm run dev:turbopack -- --experimental-turbo-trace` if you need fine-grained tracing.

## Profiling workflows

### Bundle-size snapshots

1. Run the automated analyzer:
   ```bash
   npm run metrics:bundle
   ```
   This runs `next build`, parses `.next/app-build-manifest.json`, and writes `docs/bundle-metrics.json` with total/shared/unique kilobytes for `/pdf-test` and `/new-work`.
2. Budgets (defaults can be overridden via environment variables):
   - `BUNDLE_BUDGET_PDF_TEST_KB` (default **420** KB unique payload)
   - `BUNDLE_BUDGET_NEW_WORK_KB` (default **220** KB unique payload)
3. The script fails with a non-zero exit code if a route crosses its budget, making it safe to wire into CI.
4. To review the raw Next.js size table, inspect the `npm run build` log emitted just before the analyzer executes.

### React rendering profiles

1. Build with profiling instrumentation:
   ```bash
   npm run build:profile
   npm start
   ```
2. Open Chrome (or Chromium) DevTools → **React Developer Tools** → **Profiler** tab.
3. Record interactions on `/pdf-test` (trigger “Download PDF”) or any artwork detail route. Each commit shows where time is spent inside `PdfGenerator`, the Sanity data hooks, etc.
4. Save the profile (JSON) to compare before/after tweaks.

### Browser-level performance

For network and CPU timing (e.g., to study the `jsPDF` impact):

1. Start either dev server (`npm run dev:turbopack` or `npm run dev:webpack`).
2. Open Chrome DevTools → **Performance** panel.
3. Hit “Record”, click “Download PDF”, stop the recording, and review scripting/painting costs. Combine with the React profile for a full picture.

## Current PDF-related bundle metrics

Latest report (`docs/bundle-metrics.json`, generated 22 Nov 2025):

| Route | Chunks | Unique KB | Shared KB | Total KB | Status |
| --- | --- | --- | --- | --- | --- |
| `/pdf-test` | 9 | 393.7 | 518.1 | 911.9 | ✅ within 420 KB budget |
| `/new-work` | 7 | 8.9 | 518.1 | 527.0 | ✅ within 220 KB budget |

“Unique KB” represents route-specific payload (shared chunks that every tracked route needs are excluded). Regenerate the file with `npm run metrics:bundle` whenever you change `PdfGenerator` or the artwork detail experiences.
