# Copilot instructions for Vocra

## Build, test, and lint commands

Primary app is `apps/landing` (Astro 5). Run commands from that directory unless noted.

```bash
cd apps/landing
pnpm install
pnpm dev
pnpm build
pnpm preview
```

There are currently no `test` or `lint` scripts configured in this repo.

Single-check smoke commands:

```bash
# Start dev server first (pnpm dev), then:
curl -sI http://localhost:4321/
curl -sI http://localhost:4321/en
curl -s -X POST http://localhost:4321/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"x@y.com","lang":"pl","source":"landing"}'
```

Expected API response shape: `{"ok":true}` on success.

## High-level architecture

- This is a monorepo in early stage, but only `apps/landing` is implemented. Planned future apps are `apps/extension` (WXT) and `apps/api` (Cloudflare Workers).
- `apps/landing/astro.config.mjs` uses Astro server output with `@astrojs/vercel` adapter, Tailwind v4 via `@tailwindcss/vite`, and Astro i18n with `defaultLocale: "pl"` and `prefixDefaultLocale: false`.
- Two route entry points drive the site:
  - `src/pages/index.astro` (Polish, `/`)
  - `src/pages/en/index.astro` (English, `/en`)
  Both compose the same section components and pass `lang` through props.
- `src/layouts/BaseLayout.astro` centralizes metadata (canonical URL, OG/Twitter tags, locale tags).
- Waitlist flow:
  - Frontend form in `src/components/Waitlist.astro` posts JSON to `/api/waitlist`.
  - Backend handler in `src/pages/api/waitlist.ts` validates input and behaves by environment:
    - **DEV:** appends JSONL entries to `.data/waitlist.jsonl`
    - **Non-DEV:** inserts into Supabase `waitlist` table; sends Resend welcome email for new (non-duplicate) signups

## Key conventions

- Product positioning is **Polish-first**. Keep Polish copy as primary (`/`), English as secondary (`/en`).
- Component-level i18n pattern is consistent across the landing page:
  - each section component takes `lang: "pl" | "en"`
  - each section defines its own local `t` dictionary (`pl`/`en`)
  - there is no shared translation store
- Keep pricing and promo claims synchronized across all user-visible touchpoints:
  - `src/components/Pricing.astro`
  - `src/components/Faq.astro`
  - `src/components/Waitlist.astro`
  - waitlist confirmation email copy in `src/pages/api/waitlist.ts`
- Tailwind setup is CSS-first (v4):
  - theme tokens live in `src/styles/global.css` under `@theme`
  - use those CSS variables in classes (`var(--color-...)`)
  - do not introduce `tailwind.config.*` unless explicitly requested
- Use path alias imports (`@/*` → `src/*`) per `tsconfig.json`.
- Do not read or grep `*.pen` design files directly; use Pencil tooling for those assets.
- This repo currently has no automated test/lint framework; avoid adding one unless explicitly requested.
