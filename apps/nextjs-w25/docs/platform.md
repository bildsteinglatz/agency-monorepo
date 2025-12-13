# Platform data guide

This document explains how the Bildstein | Glatz platform orchestrates content from **Sanity** and relational data managed with **Prisma**, how to work on each layer locally, and where the two systems intersect inside the Next.js app.

## 1. Sanity content model

The Sanity schemas that power the public-facing artwork catalogue live in `/schemas`. They are kept in plain TypeScript modules so they can be shared between the production Studio (hosted separately) and other tooling (webhooks, scripts, etc.). The current document set is:

| Schema | Purpose | Key references |
| --- | --- | --- |
| `artwork` | Primary entity for everything published on `/new-work` and related routes. | References `artist`, `category` (`fieldOfArt`, `bodyOfWork`), stores `mainImage`, Vimeo fallback, `showOnWebsite` toggle. |
| `artist` | Biographical info for collaborators; referenced by `artwork` and `exhibition`. | Holds name, portrait, bio blocks. |
| `exhibition` | Used by `/exhibitions` routes to present shows and events. | References `artwork` arrays for featured works. |
| `textDocument` | Long-form editorial content (essays, statements) rendered under `/texts`. | Supports Portable Text blocks and metadata. |
| `about` | Static structured copy for marketing pages. | Provides hero copy, contact snippets. |
| `category` + `categoryType` | Shared taxonomy for “Field of Art”, “Body of Work”, and other facets. | `categoryType` enumerates the families; `category` instances reference a type and can be attached to artworks. |

### How data reaches the app

- `sanity/client.ts` instantiates `next-sanity` clients for regular and preview modes (project `yh2vvooq`, dataset `production`).
- `src/sanity/safeFetch.ts` wraps `client.fetch` so server components can await GROQ queries without throwing on transient errors.
- Feature pages such as `app/new-work/page.tsx`, `app/artwork-by-color/page.tsx`, and API routes like `app/api/dominant-color` import GROQ strings from `sanity/artworkQueries.ts` and deserialize them into typed objects located in `src/types`.
- Scripts (`scripts/extract-dominant-colors.mjs`) also import the same queries to keep offline jobs in sync with the production schema.

Any schema change should be committed in `/schemas`, copied into the Studio project, and deployed via Sanity CLI so that editors see the updated fields.

## 2. Running Sanity Studio locally

The Studio itself lives in a separate workspace (this repo only stores the canonical schema files). To spin up a local Studio that matches production:

1. **Install prerequisites**
   - Node.js 18 or newer
   - `npm install -g @sanity/cli` (or use `npx sanity` commands inline)
2. **Bootstrap or open the Studio workspace**
   - If you already have the “studio” repo, `cd` into it; otherwise run `sanity init --create-project "Bildstein Glatz" --dataset production` and point it at project `yh2vvooq`.
3. **Link the schemas**
   - Copy the `/schemas` directory from this repo into the Studio’s `/schemas` folder (or symlink it to avoid duplication).
4. **Provide environment variables**
   - Create `.env.development` with `SANITY_STUDIO_PROJECT_ID=yh2vvooq` and `SANITY_STUDIO_DATASET=production`.
5. **Run the Studio**

   ```bash
   npm install          # within the Studio workspace
   npx sanity dev --host localhost --port 3333
   ```

6. **Deploy** when ready:

   ```bash
   npx sanity deploy
   ```

Because the Next.js site consumes the content through the hosted Sanity dataset, any document changes you make in the local Studio are immediately available to the app (subject to ISR cache if you enable it).

## 3. Prisma database layer

Prisma powers authentication (NextAuth Credentials provider) and any data that must remain private or transactional. The Prisma client is lazily loaded in `src/auth/authOptions.ts` so serverless functions only instantiate it when the user hits login flows.

### Migration workflow

1. **Model changes**
   - Edit `schema.prisma` (keep it at the repo root or inside `/prisma/schema.prisma`; the build script auto-detects either location).
2. **Regenerate types & run dev migration**

   ```bash
   npx prisma migrate dev --name descriptive_change
   npx prisma generate
   ```

   `migrate dev` applies the change to your local database defined by `DATABASE_URL`. Always commit the generated SQL under `/prisma/migrations/**`.

3. **Share migrations**
   - Push the changes to Git; CI or other teammates can run `npx prisma migrate deploy` to apply them.
4. **Inspect data (optional)**

   ```bash
   npx prisma studio
   ```

5. **Production rollout**
   - On deployment platforms (Vercel, Render, etc.), run `npx prisma migrate deploy && npx prisma generate` as part of the release pipeline.

> **Note:** If you only need to sync the schema while prototyping, `npx prisma db push` can be used, but prefer `migrate dev` so the history stays reproducible.

## 4. How Sanity and Prisma interact in the app

| Concern | Data source | Where it lives in the code |
| --- | --- | --- |
| Public catalog (grid filters, detail pages, color explorer) | Sanity | `app/new-work`, `app/artwork-by-color`, `app/work/[slug]`, etc., all call `safeFetch` against GROQ queries. |
| PDF generation assets | Sanity | `/app/pdf-test` fetches the “first artwork” image/title from Sanity, then feeds it into `PdfGenerator`. |
| Dominant color enrichment | Sanity (+ scripts) | `scripts/extract-dominant-colors.mjs` reads artwork assets, computes colors, and patches documents back through Sanity’s API. |
| Authentication, dashboard, premium gates | Prisma | `src/auth/authOptions.ts` and routes under `/app/dashboard`, `/app/login`, `/app/register` validate users with Prisma-backed `user` rows. |
| Webhooks and protected API routes | Both | `/app/api/dominant-color` verifies webhook secrets (Prisma could store secrets in the future) and then patches Sanity documents. |

In short, **Sanity** is the source of truth for anything editors curate (artworks, categories, copy), while **Prisma** holds operational data that should never ship to the public dataset (credentials, feature flags, paid users). Next.js server components can query both in the same request—fetch curated content from Sanity, then check Prisma for the signed-in user’s entitlements—before streaming UI back to the browser.

When you add features, decide which store to use by asking: _Does an editor manage this record and should it be queryable via GROQ?_ → use Sanity. _Is it sensitive, transactional, or owned by the engineering team?_ → model it in Prisma. Keeping that boundary clear ensures the site remains fast, cacheable, and safe.
