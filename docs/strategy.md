# Vocra — Full Strategic Plan

*Confirmed decisions locked 2026-05-07. Update this file when decisions change.*

## Confirmed Decisions

| Decision | Choice | Notes |
|---|---|---|
| Beachhead | **Polish-first** | Expand to CZ/SK/UA/PT in month 6 |
| Pricing | **$5/mo Pro + 30 min/day free** | ~28% less ARPU vs $7; compensated by higher conversion + tighter free-tier abuse |
| Build | **Solo through MVP** | Hire 1 backend/ML contractor after 10 paying customers |

## Assumptions

| # | Assumption | Confidence | Risk if wrong |
|---|---|---|---|
| A1 | Solo founder, bootstrapped | High | Scope must shrink |
| A2 | Polish/EU is the natural beachhead | High | Lose distribution edge |
| A3 | Founder can build Chrome ext + Node/TS backend | High | Need to hire faster |
| A4 | Target: paid users by day 90 | Medium | Push to 120 days if needed |
| A5 | "Real-time" = sub-3s latency end-to-end | High | UX falls apart above 3s |
| A6 | LLM costs continue trending down | High | Margins compress |
| A7 | YouTube auto-translate is the baseline to beat | High | Wedge weakens if YT improves |
| A8 | Users will install a browser extension | Medium | Need PWA/web fallback |
| A9 | Privacy is real but not the primary purchase driver | Medium | Reposition if needed |
| A10 | Voice cloning/dubbing is Phase-4+ moat, not MVP | High | Competitor leapfrogs |

## Phased Plan

| Phase | Days | Goal | Exit criteria |
|---|---|---|---|
| **0 — Validate** | 1–14 | Landing + waitlist + 5 interviews + Approach C service | 1 person pays, 3 say "I'd use this weekly" |
| **1 — Build MVP** | 15–45 | Chrome ext + YT + 5↔5 languages | Working extension, <3s latency, 50 closed-beta users |
| **2 — Launch & monetize** | 46–75 | Public launch + Stripe + Pro tier | Product Hunt + 100 signups + first 10 paying |
| **3 — Iterate & expand** | 76–90 | Retention, polish, second platform | 100 paying, $500 MRR, <7% monthly churn |

## Approach C — The Current Task (Phase 0)

Before writing a single line of extension code, build a one-page translation service:
**Paste YouTube URL → receive Polish transcript + .srt file**

**Why:** Tests willingness to pay AND translation quality in 1 week. Builds ~80% of the backend pipeline anyway.

**Stack:** Node/Express on Fly.io. Single `apps/api/` directory.

**API contract:**
```
POST /translate  →  { jobId }
GET  /translate/:jobId  →  { status, transcript?, srtUrl? }
```

**Billing:** 30 min/day free, $5/mo Pro (Stripe Payment Link — no custom billing code).

**Pipeline:** yt-dlp captions (primary) → Groq Whisper-large-v3 fallback → Claude Haiku 4.5 translation → .srt output. Hard limit: 45-min videos max.

**Sprint (Days 1–7):**
| Day | Task |
|---|---|
| 1 | Scaffold `apps/api/`, yt-dlp + Whisper working locally |
| 2 | `/translate` POST + async job queue + caption extraction |
| 3 | Claude Haiku translation + SRT generation + polling endpoint |
| 4 | Frontend form (`/przetlumacz`) + polling UI |
| 5 | Stripe Payment Link + Resend email delivery + Fly.io deploy |
| 6–7 | Post r/programowanie + schedule 5 interview slots on Cal.com |

**Validation target:** ≥1 person pays $5; ≥3 say "I'd use this every week."

## ICP & Positioning

**Primary ICP:** Polish developers and knowledge workers watching foreign-language (EN, DE, FR) technical/educational content on YouTube ≥2 hrs/week. Core pain: subtitle cognitive load — reading foreign subtitles breaks attention from the video. Polish subtitles are invisible; foreign subtitles are not.

**Positioning:** *"Subtitles that actually understand."* / *"Watch any video in your language. In real time."*

**Wedge:** Quality + coverage. LLM-grade translation beats YouTube on technical jargon and context. Also covers live streams and language pairs YT handles poorly.

**Competitors:**
| Competitor | Weakness | Our edge |
|---|---|---|
| YouTube auto-translate | Mediocre, weak on live + jargon | LLM quality |
| Language Reactor (1M+ users) | Built for *learners*, not *consumers* | Different ICP |
| Trancy / Eko | Lower quality, shallow product | Better translation, polished UX |
| Heygen / Descript | Async, creator-side, $30–100/mo | Real-time, viewer-side, $5/mo |

## MVP Scope — "Vocra Lite v1.0"

**MUST:**
- Chrome extension (Manifest V3, WXT)
- YouTube (regular + live streams)
- Real-time subtitles, <3s latency
- 5 source → 5 target languages (EN/ES/FR/DE/IT → PL/ES/PT/DE/FR)
- Hybrid pipeline: YT captions + LLM-improve; Groq Whisper fallback
- **Translation cache** keyed by `(videoID, segmentHash, targetLang)` — P0, not P1
- Free: 30 min/day, 1 target language
- Pro: $5/mo unlimited, 3 target languages
- Stripe Checkout + Customer Portal
- Supabase auth (Google sign-in)

**SHOULD:** Custom subtitle styling · click-word-to-define · transcript download · settings panel

**NOT IN MVP:** Dubbing · mobile native · arbitrary websites · flashcards · creator tools

## Architecture

```
[Chrome Extension: WXT] ──captions/audio──► [Cloudflare Workers + Durable Objects]
       │                                           │
       │◄──translated subs (WebSocket)─────────────│
                                                   ├──► Groq Whisper-large-v3   (transcription)
                                                   ├──► Claude Haiku 4.5         (translation)
                                                   ├──► Cloudflare KV            (translation cache)
                                                   ├──► Supabase Postgres        (auth, users, usage)
                                                   └──► Stripe                   (billing)
```

**Cost model (per active user, 10 hrs/mo, post-cache):**
- Groq Whisper: ~$0.12 (30% cache miss)
- Claude Haiku: ~$0.25 (50% cache miss)
- Infra: ~$0.30
- **Total: ~$0.70/user/mo → ~86% gross margin at $5 Pro**
- Without caching: $3–5/user → margins collapse

## Pricing

| Tier | Price | Limits |
|---|---|---|
| Free | $0 | 30 min/day, 1 target language, watermark on exports |
| **Pro** | **$5/mo** ($45/yr) | Unlimited, 3 target languages, all features |
| Team (Phase 3+) | $25/seat/mo | 5+ seats, admin, SSO |
| Lifetime (launch only) | $79, ≤300 codes | Pro forever |

## GTM Launch Sequence

| Week | Action |
|---|---|
| 1 | Domain + landing live + 3 PL community posts + Approach C service |
| 2 | 5 customer interviews; validate pain + WTP |
| 3–6 | Build MVP (solo) |
| 7 | Closed beta (50 users from waitlist) |
| 8 | Open beta + first paid signups |
| 9 | Product Hunt (Tuesday) |
| 10 | HN "Show HN" + side-by-side demo video |
| 11 | AppSumo / lifetime deal |
| 12–13 | Polish YouTube influencer outreach |

**Top channels:** r/Polska · r/programowanie · Polish FB dev groups · Polish YT creators · Product Hunt · HN · SEO · build-in-public on X

## 90-Day Milestones

| Day | Milestone | Pass condition |
|---|---|---|
| 7 | Service live + posts up | ≥5 users, ≥1 pays |
| 14 | Interviews done | 5 completed, pain confirmed at 3/5 |
| 30 | Working extension | <3s latency, EN→PL on YouTube |
| 45 | Closed beta | 50 active, NPS >30, churn <10%/wk |
| 60 | First paying | 10 × $5 = $50 MRR |
| 75 | Public launch | PH + HN, 500 signups, 30 paying |
| 90 | Traction | 100 paying, $500 MRR, <7% churn, day-7 retention >40% |

**Pivot trigger:** <30 paying by day 90 → pivot wedge (PL university partnerships or hard-of-hearing repositioning).

## Prioritized Backlog

**P0:** WXT scaffold · YT content script · WS gateway · Groq Whisper · Claude Haiku translation · **Translation cache** · Subtitle overlay UI · Supabase auth · Stripe + usage metering · Settings panel

**P1:** Live stream mode · click-word-to-define · transcript download · onboarding · usage dashboard · side-by-side demo on landing

**P2:** Coursera/Udemy/Twitch · Firefox · bilingual mode · speaker detection · PWA · referrals

**P3:** AI dubbing · voice cloning · creator API · Zoom/Meet/Teams · self-hosted Whisper GPUs
