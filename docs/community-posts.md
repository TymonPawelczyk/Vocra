# Polish community post drafts — Phase 0 validation

Goal: 100+ waitlist signups in the first 14 days. Use these drafts as starting points; rewrite the first paragraph in your own voice before posting (Reddit's spam filters and human readers both punish copy-paste).

**Hard rules:**
- Polish only on PL communities. No corporate tone. No emoji walls. No "🚀".
- Don't hide that you're the founder — own it.
- Don't oversell. Be honest about being pre-launch.
- Reply to every comment, fast. Engagement > reach.
- Don't post the same text in two communities the same day. Stagger by 48h.

---

## 1. r/Polska (or r/PolskieRozmowy)

**Title (pick one):**
- "Buduję rozszerzenie do tłumaczenia YouTube na polski lepsze niż automatyczne napisy. Szukam ludzi do bety."
- "Robicie sobie czasem przerwy w oglądaniu po angielsku, bo automatyczne tłumaczenie YouTube to porażka? Buduję na to lekarstwo."

**Body:**

Cześć,

Od kilku lat oglądam masę technicznego YT po angielsku — wykłady, prelekcje, podcasty o programowaniu. Automatyczne napisy YouTube w polskim to dramat: tłumaczy słowo po słowie, gubi sens, żargon techniczny robi się komediowy.

Buduję rozszerzenie do Chrome (`Vocra`), które zamiast tego puszcza transkrypt przez nowoczesny model językowy (Claude). Efekt: napisy brzmią jak po polsku, a nie jak Google Translate z 2015.

Na ten moment to jeszcze pre-MVP — landing page i lista oczekujących. Cel: zamknięta beta 6 czerwca 2026, pierwsi płacący użytkownicy ok. 6 lipca. Pro $5/mies, free 30 min dziennie.

Jeśli coś podobnego miałoby dla was sens — daj znać tutaj albo zapisz się: **vocra.dev**

Pierwsze 200 osób z listy → 50% rabatu na pierwszy rok.

Co mnie najbardziej interesuje:
1. Jakie filmy oglądacie po angielsku, gdzie tłumaczenie YT was wkurza?
2. Co byście zapłacili za działającą wersję (jeśli w ogóle)?
3. Czy ktoś z was prowadzi już własne tłumaczenia / VLC subtitles / Language Reactor?

Każda opinia super pomocna. Krytyka mile widziana.

— Tymon

---

## 2. r/programowanie (or r/Polska_wPubie / r/Frontend)

**Title:**
- "Pre-MVP: Vocra — rozszerzenie do tłumaczenia YT na polski (Claude + Whisper). Szukam beta-testerów."

**Body:**

Hej,

Buduję narzędzie, które prawdopodobnie poznacie z własnego życia: **YouTube auto-translate na polski jest tragiczny**, zwłaszcza dla content techniczny. Server Components, embedding, tail call optimization — wszystko leci jako bezsensowna kalka.

Stack:
- Chrome extension (Manifest V3, WXT)
- Cloudflare Workers + Durable Objects (WebSocket, low latency)
- Whisper-large-v3 (Groq) jako fallback transkrypcji
- Claude Haiku 4.5 jako tłumacz
- Cache na Cloudflare KV (popularne filmy → koszt prawie zero)

Plan: <3s latencji end-to-end. Działa na live streamach. Pricing $5/mies Pro + 30 min/dzień free.

Etap: Phase 0. Landing + waitlist są live. MVP buduję sam, target: zamknięta beta 6 czerwca 2026, public launch ok. 6 lipca.

Co tu szukam:
- 50 beta-testerów (programiści/AI/ML/devops oglądający YT po angielsku) → wczesny dostęp + rabat
- Feedback techniczny: ktoś widzi pułapkę w architekturze, której nie widzę?
- Komentarze do unit-economics: $5/mies przy ~$0.50/h LLM costs, czy się to da spiąć tylko cache'em?

**Link: vocra.dev**

Jak ktoś chce pogadać 1:1 (15 min), wpadnijcie do mnie na DM, mam slot na kilka rozmów w tym tygodniu.

— Tymon

---

## 3. Polish dev FB group (np. "Polscy programiści" / "Programiści JavaScript Polska")

Body (krótko, bez tytułu — FB nie ma tytułów postów):

Cześć grupo,

Od miesiąca buduję `Vocra` — rozszerzenie do Chrome, które tłumaczy YouTube na polski **lepiej** niż automatyczne napisy YT. Pod spodem Claude + Whisper, działa też na live streamach.

To jeszcze pre-MVP. Mam landing i listę oczekujących. Pierwsze 200 osób → 50% na pierwszy rok ($5/mies).

Pytanie do was — szczególnie tych, którzy oglądają po angielsku tutoriale, prelekcje z konferencji, AI-content:
1. Korzystacie z czegoś takiego dziś (Language Reactor, Trancy)?
2. Co was najbardziej wkurza w napisach YT?
3. Czy $5/mies za dobre tłumaczenie to dla was OK, czy już za drogo?

Link w komentarzu.

(I tak — możecie wpisać nawet bzdurnego maila na waitlist, bardziej zależy mi na liczbie zapytań niż adresach. Ale wolę realne.)

— Tymon

---

## 4. Twitter/X build-in-public thread (PL)

5-tweet thread. Pin for the day. Reply to every quote/reply within 30 min for first 6 hours. Attach the new hero mockup (or a real screenshot of the landing) to tweet 2.

**Tweet 1 — hook:**

> Polskie napisy na YouTube to dramat — szczególnie na techu.
>
> Buduję na to lekarstwo: rozszerzenie Chrome, które tłumaczy w czasie rzeczywistym przez Claude.
>
> Pierwsze 200 osób z listy → 50% rabatu na rok Pro.
>
> vocra.dev

**Tweet 2 — visual** (attach screenshot of landing hero / mockup):

> Tak to wygląda. Klikasz play, czytasz po polsku.
>
> Bez ustawień, bez konta, bez nauki języka.

**Tweet 3 — the wedge:**

> YouTube auto-translate tłumaczy słowa.
> Vocra tłumaczy sens.
>
> "Server Components" → "komponenty serwera" (yt) vs. "Server Components" (vocra, zostawia term).
> "Tail call optimization" → "optymalizacja połączenia ogona" (yt) vs. "TCO" (vocra).
>
> Im bardziej techniczny content, tym większa różnica.

**Tweet 4 — transparency / build-in-public:**

> Stack:
> · Chrome ext (WXT, Manifest V3)
> · Cloudflare Workers + Durable Objects
> · Whisper-large-v3 przez Groq
> · Claude Haiku 4.5 jako tłumacz
> · Cloudflare KV cache (popularne filmy → koszt prawie zero)
>
> Cel: <3s latencji end-to-end. Działa na live'ach.

**Tweet 5 — CTA:**

> Beta: 6 czerwca 2026 (pierwsze 50 osób z listy).
> Public: ok. 6 lipca.
>
> $5/mies Pro · 30 min/dzień free.
>
> Jeśli sami wracacie z YT z bólem głowy — zapiszcie się: vocra.dev
>
> Każdy DM/komentarz pomaga.

---

## 5. LinkedIn (PL)

Adapted from Post 2 but tuned for LinkedIn voice — refleksyjnie, mniej slangowo, trochę "dlaczego to robię". 200–250 słów.

**Body:**

Po roku oglądania ~5 godzin tygodniowo angielskiego YT — głównie wykładów konferencyjnych, podcastów technicznych, prelekcji o AI — doszedłem do wniosku, że nie da się dłużej polegać na automatycznym tłumaczeniu YouTube.

"Server Components" zamienia się w "komponenty serwera". "Tail call" w "rozmowę ogonową". Live streamy nie mają napisów wcale. To nie jest problem znajomości angielskiego — to jest problem narzędzia, które używa modelu z 2017 do treści z 2026.

Dlatego buduję **Vocra** — rozszerzenie do Chrome, które robi to tak, jak powinno być zrobione w 2026: transkrypcja przez Whisper, tłumaczenie przez Claude, cache na popularne filmy żeby ekonomia się spinała.

Co działa już teraz w architekturze:
· <3 sekundy opóźnienia end-to-end
· Live streamy (HN/PH premieres, conf streams na żywo)
· 5 par językowych na start, kolejne dochodzą co tydzień
· $5/mies Pro, 30 min/dzień free

Etap: Phase 0. Landing i waitlist są live (vocra.dev). Beta zamknięta — 6 czerwca, public — ok. 6 lipca. Robię to solo do MVP.

Pytanie do mojej sieci, szczególnie do programistów, AI/ML researcherów i ludzi z dev rel:

1. Ile czasu w tygodniu spędzacie na anglojęzycznym content techniczym na YT?
2. Czy korzystacie dziś z czegoś podobnego (Language Reactor, Trancy)?
3. Ile byście realnie zapłacili za naprawdę dobre, real-time tłumaczenie?

Pierwsze 200 osób z waitlisty → 50% rabatu na pierwszy rok. Komentarze i DM-y — szczególnie krytyczne — bardzo pomocne.

#buildinpublic #saas #ai #poland

---

## 6. Hacker News — Show HN (EN)

**Gate:** post only if (a) landing has ≥100 waitlist signups, and (b) the side-by-side demo video referenced in `docs/strategy.md` is live and linkable. Schedule for ~9 AM Eastern, Tue/Wed. Be online and replying for 6+ hours after submission.

**Title (75-char limit):**

> Show HN: Vocra – Real-time LLM-translated YouTube subtitles

**Body:**

Hi HN,

I'm building Vocra — a Chrome extension that overlays better-translated subtitles on YouTube. The pitch: YouTube's auto-translate butchers technical content (Server Components, tail call optimization, embeddings) because it translates word-by-word with an old NMT model. Vocra runs the audio through Whisper-large-v3, sends the transcript through Claude Haiku 4.5, and renders the result over the player.

Demo (45s, side-by-side YT auto-translate vs Vocra): [VIDEO LINK]

What's working:
- <3s end-to-end latency on pre-recorded videos
- Live-stream support via a sliding window
- 5 source languages → 5 target languages
- Translation cache keyed by `(videoID, segmentHash, targetLang)` — popular videos hit ~0 marginal cost on the second viewer onward, which is what makes $5/mo viable

What's not yet:
- Polish target is the only language really dialled in; the rest are sloppy
- Live-stream latency drifts to ~5s under load
- No tier above $5/mo Pro — single-tier is the bet

Stack:
- Chrome extension (WXT, Manifest V3)
- Cloudflare Workers + Durable Objects (WebSocket for the live path)
- Groq for Whisper-large-v3
- Claude Haiku 4.5 for translation
- Cloudflare KV for the translation cache

I'd love feedback on:
1. If you've used Language Reactor or Trancy: how does this feel different? My bet is LR is for learners (flashcards, paused dual subs), Vocra is for consumers who just want to watch and move on.
2. Unit economics — at $5/mo with ~$0.50/h LLM cost, the cache is doing all the work. If you've shipped LLM-heavy SaaS, what cache strategies have you found that I'm probably about to discover the hard way?
3. Anything in the stack that screams "you'll regret this in 6 months"?

Landing + waitlist: https://vocra.dev

— Tymon

---

## 7. Product Hunt

**Gate:** launch only after closed beta (post-6 June 2026) so the first comment can claim "people are using it today." PH rewards working products more than waitlists.

**Name:** Vocra

**Tagline (60-char limit):** YouTube subtitles, finally translated by an LLM (47)

**Topics:** Chrome Extensions, Productivity, Education

**Description (260 chars max):**

> Vocra overlays LLM-translated subtitles on any YouTube video — including live streams. Powered by Whisper + Claude. Better than YouTube's auto-translate on technical content, jargon, and weak language pairs. Free 30 min/day, $5/mo for unlimited.

**First (maker) comment** — pinned, posted within 60 seconds of launch:

> Hi everyone — Tymon here, solo maker.
>
> Why I built it: Polish auto-translate on YouTube is bad enough that I switch the audio off and read English subtitles instead. That's silly in 2026. So I plugged Whisper + Claude into a Chrome extension and let them do what NMT models can't: actual context-aware translation that keeps technical terms intact.
>
> What's free: 30 min/day, 1 target language, YouTube only.
> What's $5/mo: unlimited minutes, 3 target languages, live streams, watermark-free transcript export.
>
> The trick that makes $5/mo viable: a translation cache keyed by `(videoID, segmentHash, targetLang)`. The second viewer of a popular video pays roughly nothing. Cloudflare KV does the heavy lifting; Whisper runs on Groq; Claude Haiku does translation.
>
> Today is launch day. I'll be in the comments all day — would especially love to hear:
> 1. Languages you'd want next (currently EN/ES/FR/DE/IT → PL/ES/PT/DE/FR).
> 2. Whether the latency feels right on live streams (the hard part).
> 3. Anyone using Language Reactor / Trancy who can compare?
>
> Link: vocra.dev

---

## Posting calendar (recommended)

Day 1 = first day of the campaign. Tighten the schedule if early posts overperform.

| Day | Community | Post |
|---|---|---|
| 1 | r/programowanie | Post 2 (technical angle) |
| 2 | Polish dev FB group | Post 3 |
| 4 | r/Polska | Post 1 (general angle) |
| 7 | Twitter/X (build-in-public, screenshot of landing) | Post 4 |
| 8 | LinkedIn (Polish tech network) | Post 5 |
| 10 | Indie Hackers (English) | Adapted English version (TODO) |
| 14 | Hacker News "Show HN" — only if landing has ≥100 signups + demo video | Post 6 |
| 30+ | Product Hunt — only after closed beta is live and a real cohort is using it | Post 7 |

## Comment-reply playbook

- **"Jaka jest różnica vs Language Reactor?"** → "LR jest dla uczących się języka — fiszki, podwójne napisy, pauzy. Vocra jest dla oglądających, którzy chcą po prostu zrozumieć i jechać dalej."
- **"YouTube ma już auto-translate"** → "Tak, i to jest właśnie konkurent. Zobacz porównanie na stronie — różnica w jakości jest spora, zwłaszcza na techu i live'ach."
- **"Czemu nie open-source?"** → "MVP zamknięte, żeby skupić się na unit economics. Jak osiągnę PMF, rozważę open-source komponentów (np. cache layer)."
- **Krytyka pricing** → Słuchać, nie bronić. Notować argument do bazy decyzji o cenie.
- **Typowy troll** → Ignorować. Nie odpowiadać po raz drugi.

## Metrics to track

- Posts per community (date, link, upvotes, comments)
- Click-through to landing (UTM: `?utm_source=reddit&utm_campaign=r_programowanie`)
- Waitlist conversion rate (visit → signup)
- Comment sentiment (positive / neutral / negative / hostile)

Drop a row in a Google Sheet for each post within 48h of posting.
