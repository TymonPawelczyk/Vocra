# Vocra

**Real-time translated subtitles for YouTube and online video.** Chrome extension. Polish-first. Built to beat YouTube's auto-translate on quality.

> Status: Phase 0 — landing page + waitlist. MVP build starts after 100+ waitlist signups and 5 customer interviews.

## Repository layout

```
Vocra/
├── apps/
│   └── landing/        # Astro landing page (vocra.dev)
├── docs/
│   ├── community-posts.md   # PL Reddit + FB drafts
│   └── interview-script.md  # Customer interview script
└── README.md
```

Future additions:
- `apps/extension/` — Chrome extension (WXT)
- `apps/api/` — Cloudflare Workers backend
- `packages/shared/` — shared types

## Quick start (landing page)

```bash
cd apps/landing
pnpm install
pnpm dev          # http://localhost:4321
```

Build for production:
```bash
pnpm build
pnpm preview
```

## Strategic plan

Full strategic foundation lives at `~/.claude/plans/you-are-my-ai-wise-puppy.md`. Confirmed decisions (2026-05-07):
- Beachhead: **Polish-first**, expand to CZ/SK/UA/PT in month 6
- Pricing: **$5/mo Pro + 30 min/day free tier**
- Build: **solo through MVP**, contractor after 10 paying customers

90-day targets: Day 30 working extension · Day 60 first 10 paying ($50 MRR) · Day 90 100 paying ($500 MRR).

## What to do next (founder checklist)

1. **Register domains**: `vocra.dev` (primary) + `vocra.pl` (PL redirect). Namecheap or Cloudflare Registrar — ~$30/yr total.
2. **Deploy landing page** to Vercel:
   ```bash
   cd apps/landing
   vercel --prod
   ```
   Set custom domain to `vocra.dev`.
3. **Wire waitlist API** to Resend + Supabase:
   - Create Resend account, get API key
   - Create Supabase project, create `waitlist` table (`id`, `email`, `lang`, `source`, `created_at`)
   - Add env vars in Vercel: `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
   - Replace stub in `apps/landing/src/pages/api/waitlist.ts`
4. **Post in 3 PL communities** using drafts in `docs/community-posts.md`
5. **Schedule 5 customer interviews** using script in `docs/interview-script.md` (Cal.com, 20-min slots)

## Tech stack (planned)

| Layer | Choice |
|---|---|
| Landing | Astro 5 + Tailwind 4 + Vercel |
| Extension | WXT (Vite-based, Manifest V3) |
| Backend | Cloudflare Workers + Durable Objects |
| Auth | Supabase |
| Billing | Stripe |
| Transcription | Groq Whisper-large-v3 (fallback) + YT captions |
| Translation | Claude Haiku 4.5 |
| Cache | Cloudflare KV |
| Analytics | PostHog |
| Errors | Sentry |
