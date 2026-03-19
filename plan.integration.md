# PlayENG V4 — Teljes implementációs terv

## Kiindulópont
- **Jelenlegi app**: 4 feladattípus, 23 tematikus fejezet, Oxford struktúra
- **Cél**: Greta v4 specifikáció (PlayENG_APP_INFO_v4.docx) teljes megvalósítása
- **Forrás**: `origin/dev` branch → `docs/cowork-2026-03-19/` + Greta specifkációk

## Összefoglaló: ami VÁLTOZIK

| Elem | Jelenlegi | V4 cél |
|------|-----------|--------|
| Feladattípusok | 4 | **10** |
| Tananyag struktúra | 23 fejezet (tematikus) | **20 egység (1A–5C, nyelvtan-központú)** |
| Ismétlés | Hibaszótár (manuális) | **SM-2 algoritmus (automatikus)** |
| Szintfelmérő | Nincs | **5 részes gyorsteszt** |
| Nyelvtani magyarázat | Nincs | **3 szint (alap + könyv + hang)** |
| Motiváció | XP/pont | **Szavak/feladatok száma (nem XP!)** |
| Színkódolás | Kék egységes | **Pink=szókincs, Zöld=nyelvtan, Kék=kommunikáció** |
| Begépelés | Nincs | **Wordle-stílus betűnkénti** |
| Activity | Nincs | **Párban játszható** |
| Teljes→összevont alak | Nincs | **3 körös tanítás** |
| Keresés | Nincs | **Magyar+angol nyelvtani kereső** |
| Mottó | "Nem magolsz. Beszélsz." | **"Magyar fejjel, angol nyelven."** |

---

## FÁZIS 1: Adatstruktúra átalakítás (alap)

### 1.1 — Tananyag struktúra: 23 fejezet → 20 egység (1A–5C)
**Fájl**: `backend/data/oxford3000.json` (teljes újragondolás)

Új struktúra:
```json
{
  "units": [
    {
      "id": "1A",
      "part": 1,
      "title": "To be, a/an, basic nouns",
      "grammar": {
        "rules": [...],
        "explanationBasic": "...",
        "explanationBookPages": ["1A_grammar_p17.png", ...],
        "explanationAudioUrl": "..."
      },
      "vocabulary": [...],
      "exercises": [...],
      "dialogues": [...]
    }
  ]
}
```

A 20 egység (Greta v4 alapján):
- **1A**: To be, a/an, basic nouns
- **1B**: Adjectives, colors, basic description
- **1C**: Basic emotions (happy, sad, angry, tired)
- **1D**: Present Simple (affirmative)
- **2A**: Present Simple (negative, questions)
- **2B**: Possessive adjectives + have got
- **2C**: Numbers, dates, time
- **2D**: There is / There are
- **2E**: Frequency adverbs (always, often, sometimes, never)
- **3A**: Past Simple (regular verbs, was/were)
- **3B**: Past Simple (negative, questions)
- **3C**: Appearances + personality
- **3D**: (combined from 1C + 3C advanced)
- **4A**: Present Continuous
- **4B**: Past Continuous
- **4D**: Food/Drinks + countable/uncountable
- **5A**: Present Perfect
- **5B**: Future (will, might, going to)
- **5C**: Conditional (if...then...)
- (+ szituációk: étterem, bolt, reptér, taxi, hotel, ismerettség, telefon/internet)

### 1.2 — Adatbázis séma bővítés
**Fájl**: `backend/models/user.py` + új modellek

Új táblák:
- `sm2_reviews` — SM-2 ismétlési adatok (user_id, item_id, item_type, ease_factor, interval, next_review, repetitions)
- `level_test_results` — szintfelmérő eredmények
- `grammar_rules` — nyelvtani szabályok (rule_text, examples, unit_id, explanation_basic/book/audio)

### 1.3 — Backend API bővítés
**Fájl**: `backend/app.py` + új blueprint-ek

Új endpoint-ok:
- `GET /api/units` — 20 egység listája
- `GET /api/units/:unitId` — egység részletek (szókincs + nyelvtan + feladatok)
- `GET /api/units/:unitId/exercises` — feladatok típus szerint
- `POST /api/level-test` — szintfelmérő eredmény mentése
- `GET /api/sm2/due` — esedékes ismétlendő szavak
- `POST /api/sm2/review` — ismétlés eredmény mentése
- `GET /api/grammar/search?q=` — nyelvtani keresés (magyar+angol)

---

## FÁZIS 2: Új feladattípusok (6 új)

### 2.1 — Szókincs bemutatás (Task 1)
**Új fájl**: `frontend/src/components/tasks/VocabularyIntroTask.tsx`
- Kép + szó + kiejtés (TTS normál + lassított)
- Max 6-8 szó csoportonként
- Nincs válasz, csak tanulás — automatikus lejátszás
- "Következő" gomb meghallgatás után aktív (mint a jelenlegi LessonPage Step 0)

### 2.2 — Szókincs visszakérdezés (Task 2)
**Új fájl**: `frontend/src/components/tasks/VocabularyQuizTask.tsx`
- Magyar→angol ÉS angol→magyar irányban
- 3 opciós válasz (1 helyes, 2 zavarő)
- Azonnali feedback

### 2.3 — Begépelés / Wordle-stílus (Task 3)
**Új fájl**: `frontend/src/components/tasks/TypingTask.tsx`
- Betűnkénti bevitel (48×56px négyzetek)
- Hangalapú vagy szövegalapú mód
- Zöld = helyes betű, piros = hibás
- On-screen billentyűzet (6 oszlopos grid)

### 2.4 — Nyelvtani magyarázat + Step 0 (Task 4)
**Új fájl**: `frontend/src/components/tasks/GrammarExplanationTask.tsx`
- ALAP: 2-3 soros szabály + Step 0 táblázat (mindig látszik)
- EXTRA 1 — Könyv mód: PNG oldalak lapozható modal-ban
- EXTRA 2 — Hangos tanári komment (max 2 perc audio)
- Az első feladatot automatikusan mutatja válasszal együtt

### 2.5 — Két opció választás (Task 7)
**Új fájl**: `frontend/src/components/tasks/TwoOptionTask.tsx`
- Mondat + 2 opció (pl. "I play / I plays football")
- Mindig magyarázat miért rossz a rossz válasz

### 2.6 — Activity (Task 10)
**Új fájl**: `frontend/src/components/tasks/ActivityTask.tsx`
- Rokon szavak minimális különbséggel (dog→meat, cat→milk)
- Párban játszható (ugyanazon készüléken)
- Társasjáték-szerű feladvány

### Meglévő feladatok frissítése:
- **MultipleChoiceTask** → kiegészítés narancssárga kulcsszóval (Task 6)
- **SentenceBuildingTask** → csapdás szavak hozzáadása (Task 5)
- **PronunciationTask** → 3 fázis: ismétlés + fordítás + reakció (Task 9)
- **DialogueTask** → max 2 helyes opció + 1 tipikus magyar hiba (Task 8)

---

## FÁZIS 3: SM-2 ismétlési rendszer

### 3.1 — SM-2 frontend logika
**Új fájl**: `frontend/src/utils/sm2.ts`
```
Helyes válasz → interval: 1d → 3d → 7d → 18d → 45d
Helytelen válasz → visszaáll 1 napra
3 forrás: hibás válasz + szóra kattintás (2×) + lassú válasz
```

### 3.2 — Ismétlés integrálás 3 helyre
1. **Lecke során**: új anyag után → ismétlés előző lecke hibáiból
2. **Napi Gyorspróba**: belépéskor esedékes szavak
3. **Leckébe beépített**: random visszakérdezés korábbi anyagból

### 3.3 — Napi ismétlés képernyő
**Módosítás**: `frontend/src/pages/DailyChallengePage.tsx`
- Jelenlegi napi kihívás + SM-2 esedékes szavak kombinálása
- "Daily Review" gomb a főoldalon

---

## FÁZIS 4: Szintfelmérő

### 4.1 — Szintfelmérő képernyő
**Új fájl**: `frontend/src/pages/LevelTestPage.tsx`
- 5 rész × 1 perc × 5 kérdés
- Progresszív: fail Part 1 → start 1A, pass Part 1 fail Part 2 → start 2A, stb.
- A LEGNEHEZEBB kérdések (nem "cat"-et kérdez)
- Eredmény + becsült elsajátítási idő (130-185 óra)
- Napi tanulási cél választás (20/30/45/60 perc)

### 4.2 — Onboarding flow
**Új fájl**: `frontend/src/pages/OnboardingPage.tsx`
- Splash → 3 lépéses onboarding → Szintfelmérő → Főoldal
- Mottó: "Magyar fejjel, angol nyelven."
- 3 feature card a prototípus alapján

---

## FÁZIS 5: UI/UX átdolgozás

### 5.1 — Navigáció és struktúra
- **Főoldal**: 20 egység lista (nem 6 szint + fejezetek)
- **Egység kártya**: színkódolt szegély (pink/zöld/kék)
- **10 feladat lista**: egységre kattintva 10 feladat kártya
- **Bottom nav**: Tanulás | Ismétlés | Szószedet | Profil

### 5.2 — Motiváció átdolgozás (NEM XP!)
- "127 szót tanultál" (nem "1250 XP")
- "3 feladat kész" (nem "15 pont")
- Szint: "⭐⭐ Tanuló — Még 3 lecke a következő szintig"
- Streak megtartás, de emberi nyelven

### 5.3 — Színkódolás
- **Pink (#E91E63)** = szókincs feladatok
- **Zöld (#4CAF50)** = nyelvtan feladatok
- **Kék (#1565C0)** = kommunikáció (párbeszéd, speaking)
- **Narancs (#FF9800)** = activity/játék + kiemelések

### 5.4 — Nyelvtani összefoglaló + keresés
**Új fájl**: `frontend/src/pages/GrammarSummaryPage.tsx`
- Minden tanult szabály egy helyen
- Táblázatok igeidőnként
- Keresőmező (magyar + angol): "can" → Can egység, "múlt idő" → Past Simple
- "Gyakorolj" gomb minden szabálynál

### 5.5 — Teljes szószedet oldal
**Új fájl**: `frontend/src/pages/VocabularyPage.tsx`
- 972 szó, rendezés: ábécé / kategória / egység
- Szűrők: tanult / hibázott / összes
- Kattintás → kiejtés + fordítás

### 5.6 — Progress dashboard (plan.md eredeti 6 lépés is benne)
- "X/972 szó tanulva" progress bar
- Smart resume: "Folytatás: 2A, 3. feladat"
- Egység progress barok
- Bottom navigation
- Streak javítás (0 napnál is mutasson)

---

## FÁZIS 6: Tartalom előkészítés

### 6.1 — Tananyag digitalizálás (Greta feladata)
A Tananyag Útmutató szerint:
1. Master Vocabulary Excel (972 szó, deduplikálva)
2. Grammar Rules JSON (20 egység)
3. Questions Excel (~1500-2400 kérdés, 10 típusonként)
4. Dialogues Excel (7 szituáció)
5. Könyvoldal PNG-k (20 egység, ~40-60 kép)

### 6.2 — Import szkriptek
**Új fájlok**: `scripts/import_vocabulary.py`, `scripts/import_grammar.py`, `scripts/import_exercises.py`
- Excel → JSON konverterek
- Validáció (duplikáció, hiányzó mezők)

---

## Implementációs sorrend (javasolt)

| # | Fázis | Becsült méret | Függőség |
|---|-------|---------------|----------|
| 1 | Adatstruktúra (1.1-1.3) | Nagy | Greta vocabulary/grammar Excel |
| 2 | Szintfelmérő + Onboarding (4.1-4.2) | Közepes | Fázis 1 |
| 3 | Új feladattípusok (2.1-2.6) | Nagy | Fázis 1 |
| 4 | SM-2 ismétlés (3.1-3.3) | Közepes | Fázis 1 |
| 5 | UI/UX átdolgozás (5.1-5.6) | Nagy | Fázis 1-4 |
| 6 | Tartalom import (6.1-6.2) | Közepes | Greta Excel táblák |

---

## Fontos megjegyzések
- A jelenlegi 4 feladattípus MEGMARAD, csak bővül 10-re
- Az auth/billing/AI tutor/PWA kód MEGMARAD
- Az oxford3000.json struktúra VÁLTOZIK (23 fejezet → 20 egység)
- A design a prototípus (PlayENG_Prototype.html) alapján készül
- Greta döntései: nem XP hanem szavak száma, narancssárga kulcsszó, Wordle begépelés, SM-2, 3 körös teljes→összevont alak
