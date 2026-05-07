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

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore

---

## Full Strategic Plan

*Confirmed decisions locked 2026-05-07. Update this section when decisions change.*

### Confirmed Decisions

| Decision | Choice | Notes |
|---|---|---|
| Beachhead | **Polish-first** | Expand to CZ/SK/UA/PT in month 6 |
| Pricing | **$5/mo Pro + 30 min/day free** | ~28% less ARPU vs $7; compensated by higher conversion + tighter free-tier abuse |
| Build | **Solo through MVP** | Hire 1 backend/ML contractor after 10 paying customers |

### Assumptions

| # | Assumption | Confidence | Risk if wrong |
|---|---|---|---|
| A1 | Solo founder or ≤3-person team, bootstrapped/pre-seed | High | Scope must shrink |
| A2 | Polish/EU is a natural first beachhead (founder is PL-based) | High | Lose distribution edge |
| A3 | Founder is technically capable: Chrome ext + Node/TS backend | High | Need to hire faster |
| A4 | Target launch in 60–90 days, paid users by day 90 | Medium | Push to 120 days if needed |
| A5 | "Real-time" means sub-3s latency end-to-end | High | UX falls apart above 3s |
| A6 | LLM costs continue trending down through 2026 | High | Margins compress |
| A7 | YouTube auto-translate quality is the *baseline to beat*, not zero | High | Wedge weakens if YT improves |
| A8 | Users will install a browser extension (high friction but doable) | Medium | Need PWA/web fallback |
| A9 | Privacy concerns are real but not the primary purchase driver | Medium | Reposition if needed |
| A10 | Voice cloning / dubbing is a Phase-4+ moat, not MVP | High | Competitor leapfrogs |

### Phased Plan

| Phase | Days | Goal | Exit criteria |
|---|---|---|---|
| **0 — Validate** | 1–14 | Landing page, waitlist, 20 interviews | 100+ waitlist, 5 verbal "yes I'd pay $5/mo" |
| **1 — Build MVP** | 15–45 | Chrome ext + YT support + 5↔5 languages | Working extension, <3s latency, 50 closed-beta users |
| **2 — Launch & monetize** | 46–75 | Public launch + Stripe + Pro tier | Product Hunt + 100 signups + first 10 paying |
| **3 — Iterate & expand** | 76–90 | Retention, polish, second platform | 100 paying, $500 MRR, <7% monthly churn |

### ICP & Positioning

**Primary ICP:** Polish developers and knowledge workers who watch foreign-language (EN, DE, FR) technical or educational content on YouTube. Core pain: subtitle cognitive load — reading foreign subtitles breaks attention from the video. Vocra makes Polish subtitles instant and invisible so they can watch, not read.

**Positioning:** *"Subtitles that actually understand."* / *"Watch any video in your language. In real time."*

**Wedge:** Quality + coverage. LLM-grade translation (Claude Haiku 4.5) beats YouTube's model on technical jargon and context. Also covers language pairs and live streams YT handles poorly.

**Competitors to know:**
- YouTube auto-translate: free, mediocre, weak on live and tech jargon
- Language Reactor (1M+ users): targets *learners*, not *consumers* — different ICP
- Trancy / Eko: cheap browser extensions, lower quality
- Heygen / Descript: async AI dubbing, creator-side, $30–100/mo

### MVP Scope — "Vocra Lite v1.0"

**MUST:**
- Chrome extension (Manifest V3, WXT framework)
- YouTube (regular videos + live streams)
- Real-time subtitles, <3s latency
- 5 source languages (EN, ES, FR, DE, IT) → 5 targets (PL, ES, PT, DE, FR)
- Hybrid pipeline: YT captions when available + LLM-improve; Groq Whisper-large-v3 fallback
- Translation cache keyed by `(videoID, segmentHash, targetLang)` — **P0, not P1**
- Free tier: 30 min/day, 1 target language
- Pro tier: **$5/mo** unlimited, 3 target languages
- Stripe Checkout + Customer Portal
- Supabase auth (Google sign-in)
- Landing page (built: `apps/landing/`)

**SHOULD:** Custom subtitle styling · click-word-to-define · transcript download (.txt/.srt) · settings panel

**NICE TO HAVE (Phase 2/3):** Other sites · mobile PWA · AI dubbing · voice cloning · Firefox port · bilingual mode

**NOT IN MVP:** Dubbing/voice cloning · mobile native · arbitrary websites · Language Reactor-style flashcards · creator tools

### Architecture

```
[Chrome Extension: WXT] ──audio/captions──► [Cloudflare Workers + Durable Objects]
       │                                           │
       │◄──translated subs (WebSocket)─────────────│
       │                                           ├──► Groq Whisper-large-v3   (transcription fallback)
       │                                           ├──► Claude Haiku 4.5         (translation)
       │                                           ├──► Cloudflare KV/Upstash    (translation cache)
       │                                           ├──► Supabase Postgres        (auth, users, usage)
       │                                           └──► Stripe                   (billing)
```

**Key decisions:**

| Decision | Choice | Rationale |
|---|---|---|
| Transcription | YT captions first; Groq Whisper fallback | Free + ~10× faster than OpenAI |
| Translation | Claude Haiku 4.5 (primary), GPT-4o-mini fallback | Cheap, fast, high quality on PL/Slavic |
| Cache | Cloudflare KV, hash by (videoID, segmentHash, targetLang) | Popular videos hit cache → cost → ~zero |
| Streaming | WebSocket | Lowest-latency bidirectional |
| Backend | Cloudflare Workers + Durable Objects | Edge latency, scales to zero |
| Auth | Supabase Auth (Google + email) | Fastest path |
| Payments | Stripe Checkout + Customer Portal | Standard |
| Extension | WXT (Vite-based, Manifest V3) | Modern DX, hot reload, TS-first |
| Observability | Sentry + PostHog | Errors + product analytics |

**Cost model (per active user, 10 hrs/mo, post-cache):**
- Groq Whisper: ~$0.12 (30% cache miss × $0.04/hr × 10 hrs)
- Claude Haiku: ~$0.25 (50% cache miss × $0.05/hr × 10 hrs)
- Infra: ~$0.30/user
- **Total: ~$0.70/user/mo at scale. Gross margin ~86% at $5 Pro.**
- Without caching: $3–5/user → margins collapse. Caching is non-negotiable.

### Pricing

| Tier | Price | Limits |
|---|---|---|
| Free | $0 | 30 min/day, 1 target language, watermark on exports |
| **Pro** | **$5/mo** ($45/yr) | Unlimited, 3 target languages, all features |
| Team (Phase 3+) | $25/seat/mo | 5+ seats, admin, SSO |
| Lifetime (launch only) | $79, ≤300 codes | Pro forever |

### GTM Launch Sequence

| Week | Action |
|---|---|
| 1 | Domain (`vocra.dev` + `vocra.pl`) + landing live + 3 PL community posts |
| 2 | 20 customer interviews from waitlist; refine positioning |
| 3–6 | Build MVP (solo) |
| 7 | Closed beta (50 users from waitlist) |
| 8 | Open beta + first paid signups |
| 9 | Product Hunt launch (Tuesday) |
| 10 | Hacker News "Show HN" + side-by-side demo video |
| 11 | AppSumo / lifetime deal pulse |
| 12–13 | Polish YouTube influencer outreach |

**Top channels (priority):** Polish Reddit (r/Polska, r/programowanie) · Polish FB dev groups · Polish YT creators · Product Hunt · HN "Show HN" · SEO ("translate YouTube to Polish") · build-in-public on X

### 90-Day Milestones

| Day | Milestone | Pass condition |
|---|---|---|
| 7 | Waitlist + interviews | 100+ signups, 5 interviews, 3 verbal "I'd pay" |
| 14 | Clickable prototype | Side-by-side YT-vs-Vocra demo on 3 PL-relevant videos |
| 30 | Working extension | <3s latency, translates EN→PL on YouTube |
| 45 | Closed beta | 50 active users, NPS >30, churn <10%/wk |
| 60 | First paying | 10 paying × $5 = $50 MRR |
| 75 | Public launch | PH + HN, 500 signups, 30 paying |
| 90 | Traction | 100 paying, $500 MRR, <7% churn, day-7 retention >40% |

**Pivot trigger:** <30 paying by day 90 → pivot wedge. Candidates: PL university partnerships for student licenses, or hard-of-hearing-in-non-EN-markets repositioning.

### Prioritized Backlog

**P0 (must ship):** WXT scaffold · YT content script · WS gateway · Groq Whisper · Claude Haiku translation · **Translation cache** · Subtitle overlay UI · Landing (done: `apps/landing/`) · Supabase auth · Stripe + usage metering · Settings panel

**P1 (beta polish):** Live stream mode · click-word-to-define · transcript download · onboarding · usage dashboard · side-by-side demo on landing

**P2 (post-launch):** Coursera/Udemy/Twitch · Firefox · bilingual mode · speaker detection · PWA mobile-web · referrals

**P3 (future moat):** AI dubbing · voice cloning · creator API · Zoom/Meet/Teams · self-hosted Whisper GPUs
