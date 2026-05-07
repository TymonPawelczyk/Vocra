# Vocra — Unit Economics Analysis

*Obliczone 2026-05-07 na podstawie aktualnych cen API i planu z `strategy.md`*

---

## 📋 Założenia z planu

| Parametr | Wartość |
|---|---|
| **Cena Pro** | $5/mo ($45/yr) |
| **Free tier** | 30 min/day, 1 język |
| **Lifetime deal** | $79, max 300 kodów |
| **Pipeline** | YT captions (primary) → Groq Whisper (fallback) → Claude Haiku 4.5 → .srt |
| **Cache key** | `(videoID, segmentHash, targetLang)` |
| **Max video** | 45 minut |

---

## 💰 Aktualne ceny API (maj 2026)

| Usługa | Cena |
|---|---|
| **Groq Whisper Large v3** | $0.111/h audio ($0.00185/min) |
| **Groq Whisper Large v3 Turbo** | $0.04/h audio ($0.000667/min) |
| **Claude Haiku 4.5 — input** | $1.00 / 1M tokenów |
| **Claude Haiku 4.5 — output** | $5.00 / 1M tokenów |
| **Cloudflare Workers** | $0.15 / 1M requestów |
| **Cloudflare KV reads** | $0.50 / 1M requestów |
| **Cloudflare KV writes** | $5.00 / 1M requestów |
| **Cloudflare KV storage** | $0.50 / GB / miesiąc |
| **Cloudflare DO compute** | $12.50 / 1M GB-s |
| **Cloudflare DO WebSocket** | 20 msg = 1 request ($0.15/1M req) |

---

## 📊 Scenariusze użycia

### Profil użytkownika

Typowy Pro user: ogląda **10h filmów/miesiąc** (to ~2.5h/tydzień, realistyczne dla ICP).

1 minuta filmu ≈ 150 słów ≈ ~200 tokenów (input do tłumaczenia)
Output tłumaczenia ≈ ~220 tokenów (polski jest ~10% dłuższy od angielskiego)

---

## Scenariusz 1: Z cachem (docelowy)

Plan zakłada cache `(videoID, segmentHash, targetLang)`.

### Założenia cache hit rate

| Komponent | Cache hit | Uzasadnienie |
|---|---|---|
| **Whisper (transkrypcja)** | 70% | Popularne filmy mają captions z YT → nie trzeba Whisper w ogóle. Whisper to fallback. |
| **Claude Haiku (tłumaczenie)** | 50% | Popularne filmy + powtórne oglądanie + inni userzy tego samego filmu |

### Kalkulacja — Groq Whisper

```
10h/mo × 30% cache miss (Whisper tylko jako fallback) = 3h transkrypcji
3h × $0.111/h = $0.333
```

> [!TIP]
> Jeśli użyjesz **Whisper Turbo** zamiast Large v3:
> 3h × $0.04/h = **$0.12** (64% taniej!)

### Kalkulacja — Claude Haiku 4.5

```
10h = 600 min × 50% cache miss = 300 min do przetłumaczenia

Input:  300 min × 200 tokenów/min = 60,000 tokenów → 0.06M × $1.00 = $0.06
Output: 300 min × 220 tokenów/min = 66,000 tokenów → 0.066M × $5.00 = $0.33

Razem Claude: $0.39
```

### Kalkulacja — Infrastruktura Cloudflare

```
Workers requests: ~10,000 req/mo (polling + translate + auth) → $0.0015
KV reads (cache lookups): ~18,000/mo → $0.009
KV writes (cache saves): ~6,000/mo → $0.03
KV storage (rosnące): ~50 MB → $0.025
DO (WebSocket sessions): 10h = 600 min → ~36,000 WS msg → 1,800 req → ~$0.00
Workers platform min: $5/mo (shared across ALL users)

Per-user infra: ~$0.07 (excl. platform fee)
```

### ✅ Total — Scenariusz 1 (z cache, 10h/mo)

| Składnik | Koszt/user/mo |
|---|---|
| Groq Whisper (Large v3) | $0.33 |
| Claude Haiku 4.5 | $0.39 |
| Infrastruktura | $0.07 |
| **TOTAL** | **$0.79** |
| **Przychód (Pro)** | **$5.00** |
| **Gross profit** | **$4.21** |
| **Gross margin** | **84.2%** |

> [!NOTE]
> Z Whisper Turbo zamiast Large v3: total = **$0.58** → margin = **88.4%** 🎉

---

## Scenariusz 2: Bez cache'a (worst case)

### Kalkulacja — Groq Whisper

```
10h/mo, ale nadal ~70% filmów ma YT captions → Whisper tylko na 30%
3h × $0.111/h = $0.333
(Whisper nie zyskuje dużo z cache — bo YT captions to primary source)
```

### Kalkulacja — Claude Haiku (KAŻDY segment tłumaczony)

```
10h = 600 min, 0% cache hit

Input:  600 min × 200 tok = 120,000 tok → 0.12M × $1.00 = $0.12
Output: 600 min × 220 tok = 132,000 tok → 0.132M × $5.00 = $0.66

Razem Claude: $0.78
```

### ⚠️ Total — Scenariusz 2 (bez cache'a, 10h/mo)

| Składnik | Koszt/user/mo |
|---|---|
| Groq Whisper | $0.33 |
| Claude Haiku 4.5 | $0.78 |
| Infrastruktura | $0.10 |
| **TOTAL** | **$1.21** |
| **Przychód (Pro)** | **$5.00** |
| **Gross profit** | **$3.79** |
| **Gross margin** | **75.8%** |

---

## Scenariusz 3: Power user (heavy, 30h/mo)

Ktoś ogląda ~1h dziennie. To 3× typowego użytkownika.

### Z cache (50% Claude, 70% Whisper fallback ratio)

```
Whisper: 30h × 30% fallback × 30% cache miss = 2.7h → $0.30
         (ale przy 30h bardziej prawdopodobne jest 30h × 30% = 9h, z cache miss 30% = 2.7h)
         Bardziej realistycznie: 30h × 30% = 9h × $0.111 = $1.00

Claude input:  30h × 60 min × 50% miss × 200 tok = 180,000 → $0.18
Claude output: 30h × 60 min × 50% miss × 220 tok = 198,000 → $0.99
Claude total: $1.17

Infra: ~$0.20
```

| Składnik | Koszt/user/mo |
|---|---|
| Groq Whisper | $1.00 |
| Claude Haiku 4.5 | $1.17 |
| Infrastruktura | $0.20 |
| **TOTAL** | **$2.37** |
| **Przychód** | **$5.00** |
| **Gross margin** | **52.6%** |

### Bez cache (power user nightmare)

```
Whisper: 9h × $0.111 = $1.00
Claude: 1800 min × 200 tok = 360K → $0.36 input
        1800 min × 220 tok = 396K → $1.98 output
Claude total: $2.34
Infra: $0.30

TOTAL: $3.64
Margin: 27.2% 😬
```

---

## 📈 Analiza wrażliwości

| Scenariusz | Użycie/mo | Cache | COGS/user | Margin | Verdict |
|---|---|---|---|---|---|
| Light user (5h) | 5h | ✅ 50% | $0.40 | 92% | 🟢 Świetne |
| **Typowy (10h)** | **10h** | **✅ 50%** | **$0.79** | **84%** | **🟢 Zdrowe** |
| Typowy bez cache | 10h | ❌ 0% | $1.21 | 76% | 🟡 OK |
| Power user (30h) | 30h | ✅ 50% | $2.37 | 53% | 🟡 Ciasno |
| Power user no cache | 30h | ❌ 0% | $3.64 | 27% | 🔴 Niebezpiecznie |
| Extreme (60h) | 60h | ❌ 0% | $7.28 | -46% | 🔴 Strata! |

---

## 🧮 Break-even: ile użytkowników potrzebujesz na stałe koszty?

### Stałe koszty miesięczne (minimalne, solo founder)

| Koszt | Kwota |
|---|---|
| Cloudflare Workers plan | $5/mo |
| Supabase (Free→Pro) | $0–25/mo |
| Domena + DNS | ~$1/mo |
| Stripe fees (2.9% + $0.30/tx) | ~$0.45/tx |
| Vercel (landing, Pro) | $0–20/mo |
| **Total stałe** | **~$10–50/mo** |

### Break-even przy $5/mo, typowy user ($0.79 COGS):

```
Contribution margin = $5.00 - $0.79 = $4.21/user
Break-even (na $50 stałych): $50 / $4.21 = ~12 users
```

> [!IMPORTANT]
> **Potrzebujesz ~12 paying users żeby pokryć stałe koszty.** To jest realistyczne nawet w Phase 2.

---

## 🔍 Kluczowe wnioski

### ✅ Co się spina

1. **Przy typowym użyciu (10h/mo) z cache → 84% margin** — to zdrowy biznes SaaS.
2. **Claude Haiku 4.5 jest zaskakująco tani** — $0.39/user/mo za tłumaczenie to groszowe koszty.
3. **Groq Whisper to fallback, nie primary** — większość filmów ma YT captions, więc Whisper kosztuje mniej niż się wydaje.
4. **Break-even na 12 userach** — bardzo osiągalne.

### ⚠️ Na co uważać

1. **Cache jest KRYTYCZNY** — bez niego power users zabijają marginy. Dobrze, że to P0 w backlogu.
2. **Musisz mieć usage cap albo throttling** — 30h+/mo bez cache to strata. Rozważ:
   - Soft cap na "unlimited" (np. fair use policy: 100h/mo)
   - Albo: tier z limitem godzin (np. Pro = 50h/mo)
3. **Lifetime deal ($79) = ~16 miesięcy typowego użytkownika** — OK jeśli retencja > 16 mies. Ryzykowne jeśli nie.
4. **Free tier (30 min/day = ~15h/mo)** — kosztuje ~$0.60/user/mo bez cache. Przy 1000 free users to $600/mo z zero revenue. Monitoruj konwersję free→paid agresywnie.

### 💡 Rekomendacja

> [!TIP]
> **$5/mo się spina** przy założeniu, że:
> 1. Cache działa z day 1 (P0 ✅)
> 2. Masz fair use policy na "unlimited" (np. 80–100h/mo)
> 3. Free tier monitorujesz i ograniczasz jeśli nie konwertuje
>
> Bez tych trzech rzeczy — marginy mogą się szybko rozjechać.

---

## 🆚 Porównanie z Twoim szacunkiem z `strategy.md`

| Metryka | Twój szacunek | Moja kalkulacja | Delta |
|---|---|---|---|
| Total COGS (10h, cache) | ~$0.70 | **$0.79** | +13% (blisko!) |
| Groq Whisper | ~$0.12 | $0.33 | ⚠️ 2.75× — Twój szacunek zakładał wyższy cache hit |
| Claude Haiku | ~$0.25 | $0.39 | ⚠️ 1.56× — output tokens droższe niż input |
| Infra | ~$0.30 | $0.07 | ✅ CF jest tańsze niż zakładałeś |
| Gross margin | ~86% | **84%** | ✅ Praktycznie się zgadza |

> [!NOTE]
> Twój szacunek w `strategy.md` (~$0.70, ~86%) jest **optymistyczny ale realistyczny**. Różnica wynika głównie z tego, że zakładałeś wyższy cache hit rate na Whisper (co jest fair — zależy od popularności filmów, które userzy oglądają).
