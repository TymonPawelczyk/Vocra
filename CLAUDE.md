# CLAUDE.md

## What this is

Vocra is a pre-MVP SaaS — a Chrome extension for real-time translated subtitles on YouTube. The repo currently contains only the **Phase 0 landing page**; the extension and backend do not yet exist.

**Locked product decisions** (do not change without explicit instruction):
- **Beachhead: Polish-first.** Polish copy is primary at `/`, English at `/en`.
- **Pricing: $5/mo Pro + 30 min/day free tier.** Hardcoded in `Pricing.astro`, `Faq.astro`, `Waitlist.astro`. Change all three together.
- **Stack** (future apps): WXT (Chrome ext), Cloudflare Workers + Durable Objects (backend), Supabase (auth), Stripe (billing), Groq Whisper-large-v3 (transcription), Claude Haiku 4.5 (translation), Cloudflare KV (cache).
- **Translation cache is P0.** At $5/mo, unit economics break without `(videoID, segmentHash, targetLang)` caching.

## Repository layout

```
Vocra/
├── apps/
│   └── landing/        # Astro landing page (the only app built so far)
├── docs/
│   ├── strategy.md          # Full strategic plan — read when making product/arch decisions
│   ├── community-posts.md   # PL Reddit/FB drafts + posting calendar
│   └── interview-script.md  # Mom-Test customer interview script
├── README.md
└── CLAUDE.md (this file)
```

Future apps: `apps/extension/` (WXT) and `apps/api/` (Cloudflare Workers). Use `apps/<name>/` pattern.

## Operational notes

- **Domain target: `vocra.dev`.** `astro.config.mjs` `site` set to `https://vocra.dev`.
- **Encrypted .pen files.** Never `Read` or `grep` `*.pen` files — use Pencil MCP tools only.
- **Don't commit unless asked.**

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool.

- Product ideas/brainstorming → `/office-hours`
- Strategy/scope → `/plan-ceo-review`
- Architecture → `/plan-eng-review`
- Design system/plan review → `/design-consultation` or `/plan-design-review`
- Full review pipeline → `/autoplan`
- Bugs/errors → `/investigate`
- QA/testing → `/qa` or `/qa-only`
- Code review → `/review`
- Visual polish → `/design-review`
- Ship/deploy/PR → `/ship` or `/land-and-deploy`
