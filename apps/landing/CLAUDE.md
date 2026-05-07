# Landing app — CLAUDE.md

Astro 5 landing page at `apps/landing/`. This is the only app built so far.

## Commands (run from `apps/landing/`)

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server. Defaults to port 4321; auto-bumps if occupied. |
| `pnpm build` | Production build via Vercel adapter. |
| `pnpm preview` | Preview the built bundle. |

Smoke test:
```bash
pnpm dev &
sleep 4
curl -sI http://localhost:4321/
curl -sI http://localhost:4321/en
curl -s -X POST http://localhost:4321/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"x@y.com","lang":"pl"}'  # → {"ok":true}
```

Kill stray dev processes: `pkill -f "astro.js dev"` (not just `astro` — VSCode TS server matches that).

## Architecture

- **Astro 5 + `output: 'server'` + `@astrojs/vercel`** — server output for the waitlist API; pages are SSG-fast.
- **Tailwind 4 via `@tailwindcss/vite`** — registered in `astro.config.mjs`. Tokens in `src/styles/global.css` under `@theme { ... }`. **No `tailwind.config.js`** — don't create one. Use `var(--color-accent)` in arbitrary classes.
- **i18n routing** — `defaultLocale: 'pl'`, `prefixDefaultLocale: false`. PL at `src/pages/index.astro`, EN at `src/pages/en/index.astro`. Each component takes `lang: "pl" | "en"` and uses a local `t` object. No shared i18n store.
- **Waitlist API** — `src/pages/api/waitlist.ts`. Dev: writes to `.data/waitlist.jsonl`. Prod stub: `console.log`. TODO: wire Supabase insert + Resend welcome email + PostHog event. Interface: `POST {email, lang, source}` → `{ok}` / `{error}`.
- **Path alias** — `@/*` → `src/*` in `tsconfig.json`. Use it, not relative imports.
- **No linter/tests.** Ask before adding — the founder may have preferences.

## Copy rules

- **Polish first, always.** Write PL string first, then EN translation. Don't auto-translate — write idiomatic Polish.
- **Pricing in 3 places.** If pricing changes: update `Pricing.astro`, `Faq.astro`, and `Waitlist.astro` (the "-50% off first year for first 200" line).
- **No emojis in landing copy.** Restrained dark-mode + green accent visual identity.

## Design tokens (CSS vars)

```
--color-bg: #0a0a0b
--color-bg-soft: #111114
--color-fg: #f5f5f5
--color-fg-muted: #a1a1aa
--color-accent: #00d488
--color-accent-soft: #00d48833
--color-border: #1f1f23
```

## Component map

All in `src/components/`, all accept `lang: "pl" | "en"`:

| Component | Section |
|---|---|
| `Nav.astro` | Sticky nav + lang switcher |
| `Hero.astro` | Badge, h1, CTA |
| `Comparison.astro` | YT vs Vocra side-by-side |
| `Features.astro` | 6-card grid |
| `Pricing.astro` | Free + $5/mo Pro |
| `Faq.astro` | 6 `<details>` items |
| `Waitlist.astro` | Email form → `/api/waitlist` |
| `Footer.astro` | Contact + copyright |
