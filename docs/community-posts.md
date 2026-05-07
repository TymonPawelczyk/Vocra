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

Na ten moment to jeszcze pre-MVP — landing page i lista oczekujących. Cel: zamknięta beta w 30 dni, pierwsi płacący użytkownicy w 60 dni. Pro $5/mies, free 30 min dziennie.

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

Etap: Phase 0. Landing + waitlist są live. MVP buduję sam, target 30–45 dni.

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

(I yes, możecie sobie wpisać nawet bzdurnego maila na waitlist — bardziej zależy mi na liczbie zapytań niż adresach. Ale wolę realne 😅)

— Tymon

---

## Posting calendar (recommended)

| Day | Community | Post |
|---|---|---|
| 1 | r/programowanie | Post 2 (technical angle) |
| 2 | Polish dev FB group | Post 3 |
| 4 | r/Polska | Post 1 (general angle) |
| 7 | Twitter/X (build-in-public, screenshot of landing) | New copy |
| 8 | LinkedIn (Polish tech network) | Adapted from Post 2 |
| 10 | Indie Hackers (English) | Adapted English version |
| 14 | Hacker News "Show HN" — only if landing has ≥100 signups | English version + side-by-side video |

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
