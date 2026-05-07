# Vocra customer interview script

**Goal**: validate that the wedge (better-than-YT translation for non-EN viewers) maps to a real, frequent, painful problem people will pay $5/mo to solve.

**Format**: 20 minutes. Cal.com, video on. Record with consent. Take notes verbatim where possible.

**Mom Test rules** (read before every interview):
1. Talk about *their life*, not your idea.
2. Ask about *specifics in the past*, not opinions or hypotheticals about the future.
3. Talk less, listen more.
4. Compliments are worthless. "Yeah I'd pay for that" is also worthless. Past behavior is the only real signal.

**Anti-patterns to catch yourself on**:
- "Would you use X?" → useless. Ask "When did you last try to do this?" instead.
- "Would you pay $5?" → useless. Ask "What have you spent on solving this problem before?"
- Pitching the product before understanding the pain → don't.

---

## Pre-interview (1 minute)

> "Cześć [imię], dzięki za czas. Tak jak pisałem — buduję narzędzie do tłumaczenia YouTube i innych wideo na polski. Przed pokazaniem czegokolwiek chciałbym zrozumieć, jak Ty obecnie konsumujesz treści po angielsku. Nie ma złych odpowiedzi. Mogę nagrywać? Nagranie jest tylko dla mnie, nie publikuję."

---

## Section 1 — Warm-up & current behavior (4 min)

**Goal**: anchor in real, recent behavior. No hypotheticals.

1. "Co oglądałeś ostatnio na YouTube po angielsku?" *(let them name a specific video — write down the title)*
2. "Kiedy to było? Wczoraj, w tym tygodniu?"
3. "Włączyłeś napisy?"
   - **If yes**: "Polskie czy angielskie?" → "Czemu akurat te?"
   - **If no**: "Rozumiałeś wszystko? Coś przegapiłeś?"
4. "Ile godzin w tygodniu oglądasz takie treści po angielsku?"

*Listen for:* frequency, content type (tutorials, podcasts, news), language proficiency cue.

---

## Section 2 — Pain discovery (5 min)

**Goal**: find the pain. Past tense. Specifics.

5. "Pamiętasz ostatni raz, kiedy automatyczne napisy YouTube cię wkurzyły albo zmyliły? Co to był za film, co konkretnie nie zagrało?"
   *Wait silently. The first answer is usually shallow; the third sentence is gold.*

6. "Co wtedy zrobiłeś? Wyłączyłeś napisy? Przewinąłeś? Zostawiłeś film?"
   *This is the key behavioral data point. If they say "nic, oglądałem dalej" → pain isn't real enough.*

7. "Czy zdarzyło ci się, że sięgnąłeś po inne narzędzie do tłumaczenia, oprócz YT? Co to było?"
   - DeepL? Google Translate? Language Reactor? Trancy? Otter? Inne rozszerzenie?
   - **If yes**: "Ile razy w tygodniu? Co tam płaciłeś?"
   - **If no**: "Czy szukałeś czegoś takiego kiedykolwiek?"

8. "Czy jest jakiś typ treści, którego *nie* oglądasz, bo automatyczne tłumaczenie zbyt słabo działa?"
   *(This surfaces unmet demand — a gold mine.)*

---

## Section 3 — Willingness to pay (4 min)

**Goal**: Money + commitment evidence. *Not* "would you pay."

9. "Czy wydałeś kiedykolwiek pieniądze na coś związanego z konsumowaniem treści w obcym języku? Subskrypcja, kurs, narzędzie?"
   - Ile? Jak długo trwało? Czemu zrezygnowałeś / nie zrezygnowałeś?

10. "Gdybyś oszczędzał 10 godzin miesięcznie, bo tłumaczenie nie zmuszałoby cię do cofania albo szukania czegoś po angielsku — co byś z tym czasem zrobił?"
    *(Reveals perceived value of the time, not price.)*

11. "Subskrypcje, które płacisz ze swojej kieszeni co miesiąc — wymień co przychodzi do głowy."
    *(Anchors WTP. If they list Spotify $11, Netflix $17, ChatGPT $20 — they're a buyer. If they list zero subs — careful.)*

---

## Section 4 — Demo / commitment ask (5 min)

**Goal**: Show the wedge. Get a behavioral commitment, not a verbal "yes."

Show them the side-by-side comparison from `vocra.dev/#features`.

12. "Spójrz na to. Po lewej automatyczne YT, po prawej Vocra. Co widzisz?"

13. "Jak myślisz, dla jakiego typu treści to by miało dla ciebie największe znaczenie?"

**Commitment tests** (try one — pick whichever feels right; never pitch all):

A. **Waitlist**: "Mogę cię dopisać do listy oczekujących? Pierwsze 200 osób dostaje 50% rabatu."
   *Real signal: do they say yes immediately and give a real email?*

B. **Pre-order**: "Mam wczesny dostęp dla pierwszych 50. $5 za pierwszy miesiąc, anulowalne w każdej chwili. Zarezerwuję ci miejsce, jeśli wpiszesz się dziś."
   *Real signal: card on file. This is the strongest possible.*

C. **Beta tester**: "Jeśli zrobię działającą wersję w 30 dni, czy zechciałbyś ją testować i raz w tygodniu (15 min) dawać feedback?"
   *Real signal: explicit yes + calendar block.*

14. "Znasz kogoś, komu to mogłoby się przydać? Mogę poprosić o intro?"
    *(Referrals are a signal of perceived value.)*

---

## Section 5 — Wrap (2 min)

15. "Czy jest coś, o co cię nie zapytałem, a powinienem?"
16. "Czego ci najbardziej brakuje w obecnych rozwiązaniach? Jednym zdaniem."
17. "Mogę napisać do ciebie za 2 tygodnie, jak będę miał coś do pokazania?"

Thank them. End on time. Always.

---

## Post-interview — fill in within 30 minutes

| Field | Value |
|---|---|
| Name + role | |
| Specific videos they mentioned | |
| Frequency of EN-content consumption (hrs/wk) | |
| Current workaround for translation | |
| Past spend on related tools | |
| Pain intensity (1–5) | |
| WTP signal (pre-order / waitlist / no commitment / hostile) | |
| Best quote | |
| Would interview again? (Y/N) | |
| Followups owed | |

After 5 interviews, **score the validation**:

- **Strong signal (proceed)**: 4/5 named a specific recent painful video, 3/5 currently use any workaround, 2/5 took commitment action (pre-order or beta-yes).
- **Weak signal (refine)**: 2/5 named pain, mostly hypothetical. Probably wedge is too narrow or wrong segment — adjust ICP.
- **No signal (pivot)**: Nobody names recent pain, or workaround is always "I just rewatch in English" → wedge isn't real for this segment. Pivot to a sharper one (e.g., students with foreign-language coursework, hard-of-hearing).

---

## Recruiting interviewees

Sources, in order of quality signal:
1. **Direct waitlist signups who reply to confirmation email** → highest intent
2. **Reddit/FB commenters** who engage with your post → medium intent
3. **DM cold outreach** to PL devs from Twitter/LinkedIn (5–10 a day, 1-2 will reply) → low conversion but valuable signal
4. **Personal network** (last resort — be honest about bias)

Cal.com link: 5×20-min slots/week. Don't book back-to-back; you need 30 min between to write up notes.
