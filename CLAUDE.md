# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Vocra is a pre-MVP SaaS — a Chrome extension for real-time translated subtitles on YouTube. The repo currently contains only the **Phase 0 landing page**; the extension and backend do not yet exist. Strategic decisions are locked, not exploratory.

**Locked product decisions** (do not drift from these without an explicit user instruction):
- **Beachhead: Polish-first.** Polish copy is primary at `/`, English at `/en`. Never ship features with English-only UX.
- **Pricing: $5/mo Pro + 30 min/day free tier.** Hard-coded into `Pricing.astro` and `Faq.astro`; if you change the price, change all three (the pricing page, FAQ, and waitlist incentive copy "first 200 → 50% off").
- **Stack** for future apps already chosen: WXT (Chrome extension), Cloudflare Workers + Durable Objects (backend), Supabase (auth), Stripe (billing), Groq Whisper-large-v3 (transcription), Claude Haiku 4.5 (translation), Cloudflare KV (translation cache). Don't suggest alternatives unless the user asks.
- **Translation cache is P0, not P1.** At $5/mo unit economics break without aggressive `(videoID, segmentHash, targetLang)` caching. Any backend work must keep the cache layer in mind.

The full strategic plan lives at `~/.claude/plans/you-are-my-ai-wise-puppy.md` — read it before making product/architecture suggestions.

## Repository layout

```
Vocra/
├── apps/
│   └── landing/        # Astro landing page (the only thing built so far)
├── docs/
│   ├── community-posts.md   # PL Reddit/FB drafts + posting calendar
│   └── interview-script.md  # Mom-Test customer interview script
├── README.md
└── CLAUDE.md (this file)
```

Future apps will be added at `apps/extension/` (WXT) and `apps/api/` (Cloudflare Workers). Use the same `apps/<name>/` pattern. There is no monorepo orchestrator (no Turbo/Nx/pnpm-workspaces) yet — add one only when a second app exists.

## Landing page (`apps/landing`)

### Commands

All commands run from `apps/landing/`:

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server. Defaults to port 4321; auto-bumps if occupied. |
| `pnpm build` | Production build via Vercel adapter (server output, not static). |
| `pnpm preview` | Preview the built bundle. |

Smoke test recipe (run from `apps/landing/`):
```bash
pnpm dev &
sleep 4
curl -sI http://localhost:4321/        # PL homepage → 200
curl -sI http://localhost:4321/en      # EN homepage → 200
curl -s -X POST http://localhost:4321/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"x@y.com","lang":"pl"}'  # → {"ok":true}
```

If port 4321 is held by a stray process: `pkill -f "astro.js dev"` (note `astro.js dev`, not just `astro` — VSCode TS server processes match `astro` too).

### Architecture worth knowing

- **Astro 5 + server output + Vercel adapter.** `output: 'server'` in `astro.config.mjs` because the waitlist API is dynamic. Pages are still SSG-fast; only `/api/*` is server-rendered.
- **Tailwind 4 via Vite plugin (not the classic integration).** `@tailwindcss/vite` is registered in `astro.config.mjs`; design tokens live in `src/styles/global.css` under `@theme { ... }` (CSS variables like `--color-bg`, `--color-accent`). There is **no `tailwind.config.js`** — don't create one. Use `var(--color-accent)` in arbitrary-value classes (e.g. `bg-[var(--color-accent)]`).
- **i18n routing.** `astro.config.mjs` has `i18n: { defaultLocale: 'pl', locales: ['pl','en'], prefixDefaultLocale: false }`. PL lives at `src/pages/index.astro`, EN at `src/pages/en/index.astro`. Each component takes a `lang: "pl" | "en"` prop and looks up its strings from a local `t` object — there is no shared i18n store. Keep that pattern; don't reach for `react-i18next` or similar.
- **Waitlist API is a stub.** `src/pages/api/waitlist.ts` validates email and writes to `.data/waitlist.jsonl` in dev; in production it `console.log`s. The TODO is to wire Supabase (insert into `waitlist` table) + Resend (welcome email with -50% discount code) + PostHog (funnel tag). Keep the same interface (`POST {email, lang, source}` → `{ok}` / `{error}`); the `Waitlist.astro` client script depends on it.
- **Path alias** `@/*` → `src/*` is set in `tsconfig.json`. Use it (`@/components/Hero.astro`), don't use relative imports.
- **No tests, no linter wired.** If you need them, ask the user before adding — they may have preferences (Biome vs ESLint, Vitest vs none).

### Copy & content rules

- **Polish first, always.** When adding a feature, write the PL string first, then the EN translation. Don't auto-translate via DeepL/Claude into PL — write idiomatic Polish; the founder will catch tells.
- **Pricing/discount numbers are duplicated in 3 places.** If the user changes pricing, search-and-replace across `Pricing.astro`, `Faq.astro`, and `Waitlist.astro` (the "-50% off first year for first 200" line).
- **Don't add emojis to landing copy.** The visual identity is restrained dark-mode + green accent. The community posts in `docs/community-posts.md` deliberately avoid emoji — match that voice.

## Operational notes

- **Domain target is `vocra.dev`.** `astro.config.mjs` `site` is set to `https://vocra.dev`. The `.com/.app/.io/.ai/.co` are taken; `.pl` is also planned as a 301 redirect.
- **Encrypted .pen files.** If a `*.pen` file appears in the repo, do not `Read` or `grep` it — those are Pencil design files, accessed only via the Pencil MCP server tools.
- **Don't commit unless asked.** `git init` was run with no commits; the founder may want to set up GitHub + Vercel CI before the first commit.
