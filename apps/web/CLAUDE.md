# Web app — CLAUDE.md

Astro 5 + React island player at `apps/web/`. Captions-only demo of the future Vocra player. Pre-MVP — see `docs/strategy.md` and the root `CLAUDE.md` for product context.

## What this is

- `/` (PL) and `/en` — paste a YouTube URL, choose target language → submit.
- `/watch?v=<id>&lang=pl|en` (and `/en/watch`) — YouTube IFrame player + custom subtitle overlay synced via the IFrame Player API.
- `POST /api/process` — fetches YouTube's existing captions via `youtube-transcript`, translates with Claude Haiku 4.5 (if `ANTHROPIC_API_KEY` is set), returns a cue list. Two independent fallbacks make the demo robust:
  1. **Caption-source fallback** — `youtube-transcript` is an unofficial scraper of YouTube's `timedtext` endpoint and breaks regularly (it currently returns "video no longer available" on this network even for known-captioned videos). When that happens, the API returns 14 mock English cues at fixed timestamps (`captionSource: "mock"`) so the player UX is fully demo-able.
  2. **Translator fallback** — without `ANTHROPIC_API_KEY`, cues are stubbed with `[PL DEMO]` / `[EN DEMO]` prefixes (`translator: "stub"`). With a key, Haiku translates whatever source cues we have (real or mock).

**Out of scope for this slice** (per blueprint): Whisper fallback, KV cache, Supabase auth, Stripe, anonymous quota wall, anything Cloudflare. All of those land later.

## Commands (run from `apps/web/`)

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server on port **4322** (landing uses 4321). |
| `pnpm build` | Production build via Vercel adapter. |
| `pnpm preview` | Preview the built bundle. |

Smoke test:
```bash
pnpm dev &
sleep 4
curl -sI http://localhost:4322/
curl -sI http://localhost:4322/en
curl -s -X POST http://localhost:4322/api/process \
  -H "Content-Type: application/json" \
  -d '{"videoID":"Tn6-PIqc4UM","lang":"pl"}' | head -c 200
```

The `/api/process` call hits real YouTube to fetch captions — needs network. If `ANTHROPIC_API_KEY` is unset it returns stubbed cues marked `translator: "stub"`.

## Environment variables

| Var | Purpose | Required? |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude Haiku 4.5 translation. Without it, `/api/process` returns stubbed cues. | No — recommended |

Put in `apps/web/.env` for dev. `.env*` is already gitignored at the repo root.

## Architecture

- **Astro 5** with `@astrojs/react` integration — same stack as `apps/landing/` plus React.
- **Tailwind 4** via `@tailwindcss/vite`. Tokens duplicated in `src/styles/global.css` — match landing's `@theme` block byte-for-byte. Don't introduce a `tailwind.config.js`.
- **i18n** mirrors landing: `defaultLocale: 'pl'`, `prefixDefaultLocale: false`. PL at `/` + `/watch`; EN at `/en` + `/en/watch`.
- **Vercel adapter** (`output: 'server'`) for the `/api/process` endpoint.
- **Path alias** `@/*` → `src/*`.

## Component map

| File | Role |
|---|---|
| `src/pages/index.astro` + `src/pages/en/index.astro` | Paste UI. |
| `src/pages/watch.astro` + `src/pages/en/watch.astro` | Player shell, mounts `<Player client:only="react" />`. |
| `src/components/PasteForm.astro` | URL input + lang select; client script validates via `parseVideoId` before submit. |
| `src/components/Player.tsx` | React island. Loads YT IFrame API, hides native captions, polls `getCurrentTime()` at 10 Hz, renders `<CueOverlay>`. Calls `/api/process` once per `(videoID, lang)`. |
| `src/components/CueOverlay.tsx` | Pure render. Active cue + optional source line. |
| `src/components/Nav.astro`, `Footer.astro` | Layout chrome. |
| `src/lib/cues.ts` | `Cue`, `ProcessResponse`, `parseVideoId`, `findActiveCue` (binary search). Used by both server (API route) and client (PasteForm script + Player). |
| `src/pages/api/process.ts` | Vercel API route. YT captions → Haiku → cue list, with stub fallback. |

## What demos work

1. **Paste any valid YouTube URL** → if `youtube-transcript` works, you get real captions translated; otherwise mock English cues at fixed timestamps. Either way the player UX is demo-able end-to-end.
2. **No `ANTHROPIC_API_KEY`** → cues are `[PL DEMO] <text>` / `[EN DEMO] <text>` and the UI shows a "DEMO MODE" badge.
3. **YouTube caption fetch fails** → UI shows a "MOCK CAPTIONS" amber badge plus an explanation note.
4. **Toggle source** → "Show original" button reveals the source line under the translation.
5. **Language switcher** in nav → swaps PL ↔ EN; the `?v=` param is preserved manually if you re-paste.
6. **Share / Copy link** → puts `window.location.href` on the clipboard (`navigator.clipboard` with a `document.execCommand("copy")` fallback for non-HTTPS dev).
7. **Download .srt** → builds an SRT in-memory from `cues` and triggers a `Blob` download as `vocra-<videoID>-<lang>.srt`.
8. **Open on YouTube** → escape hatch to the original `youtube.com/watch?v=...` page in a new tab.
9. **Waitlist CTA** → green panel below the player linking to `https://vocra.dev/#waitlist` (or `/en#waitlist` for the EN UI). The conversion path back to the marketing site.
10. **Two-stage loading copy** → "Fetching captions…" for the first 1.2s, then switches to "Translating…" until the API responds. Single POST under the hood; the stage flip is a `setTimeout` cosmetic.

The path back to real captions when scaling beyond the demo is the `apps/audio/` Fly.io service from the blueprint (yt-dlp + ffmpeg, not the in-process scraper).

## What's deliberately missing (don't add without asking)

- Whisper fallback for captionless videos (needs the `apps/audio/` Fly.io service from the blueprint).
- KV cache. Every request pays full Haiku cost — fine for demo, breaks unit economics at scale.
- Sign-in, quotas, abuse rate limits.
- `/api/cues/:videoID/:lang` separate read endpoint (warm path).
- Live SSE stream. Currently the API returns the full cue list in one POST response.
- Stripe.

## Public assets

- `public/favicon.svg` — same green-square logo as landing.
- `public/og.svg` — source SVG for the social card. Polish-first: "Wklej link YouTube. Oglądaj po polsku.", emphasizes the no-install demo angle to differentiate from landing's brand-card OG.
- `public/og.png` — 1200×630 rendered PNG. Render via `sharp` from a temp install (don't add `sharp` to this app's deps): `node -e "require('/tmp/og-render/node_modules/sharp')('apps/web/public/og.svg',{density:300}).resize(1200,630).png().toFile('apps/web/public/og.png')"`.

## Linking from landing

`apps/landing/src/components/Hero.astro` has a secondary CTA "Wypróbuj demo bez instalacji" / "Try the demo without installing" pointing at `/watch`. In dev, that link 404s (landing on :4321, web on :4322). In prod, both apps deploy to `vocra.dev` and Vercel rewrites route `/watch*` to apps/web. For local end-to-end testing, hit `http://localhost:4322/` directly.
