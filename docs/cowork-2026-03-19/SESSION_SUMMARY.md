# Cowork Session összefoglaló — 2026. március 19.

## Ki dolgozott: Gréta (Cowork tab-ban, Claude Opus-szal)
## Témák: App specifikáció, design, tananyag elemzés, feladattípusok

---

## AMIT MA ELÉRTÜNK

### 1. KIÉRTÉKELÉS (PlayENG_Kiertekeles.docx)
- Az eredeti APP INFO dokumentumot (Gréta korábbi verziója) 27 pontban kiértékeltük
- 5 kategória: Architektúra, Tananyag logikai hibák, Hiányzó specifikációk, UX, Tartalmi javítandók
- KRITIKUS hibák azonosítva és javítva (lásd alább)

### 2. APP INFO SPECIFIKÁCIÓ — v4.2 (PlayENG_APP_INFO_v4.docx)
Teljes specifikáció, amit a programozó (te, Roland) használhatsz. Tartalmazza:
- 10 feladattípus (12-ből 10-re csökkentve, összevonások)
- 20 nyelvtani egység (1A–5C) javított szókincs-besorolással
- 7 szituáció + kommunikációs mondatok
- Motivációs rendszer (NEM XP, hanem szavak/feladatok/szint)
- SM-2 ismétlési algoritmus
- Bővített adatbázis séma (12 tábla)
- CEFR lefedettség: A1=149%, A2=53%, B1=10-15%
- Elsajátítási idő: 130–185 óra (NEM 30-40!)
- Szintfelmérő: részenként 1 perces gyorstesztek, a legnehezebb kérdésekkel
- Keresés funkció a nyelvtani összefoglalóban (magyar + angol)
- Könyv mód: lapozható PNG oldalak + tanári hang (max 2 perc)

### 3. TANANYAG JAVÍTÁSOK (a legfontosabbak!)
| Hiba | Javítás |
|------|---------|
| 1A: hiányzott főnévlista a/an gyakorláshoz | Hozzáadva: dog, cat, bus, table, book, pen, school, university(!), apple, orange, egg, umbrella, hour(!), idea |
| 1C: megjelenés+személyiség túl korai volt | Áthelyezve 3D-be (névmások mellé) |
| 3D: érzelmi melléknevek rossz helyen | Alap érzelmek (happy, sad, angry, tired) → 1C, haladó (bored, excited, famous) → 3D |
| 4C: gyakorisági határozószók rossz helyen | Áthelyezve 2E-be (Present Simple mellé) |
| 4D: teljesen hiányzott az előző verzióból! | Visszaadva: Birtoklás 3 időben + Food/Drinks szókincs |
| Szituációk + kommunikáció szétszórva volt | Összevonva egyetlen 5. Részbe |

### 4. DESIGN PROTOTÍPUS (PlayENG_Prototype.html)
Interaktív HTML, böngészőben megnyitható:
- Splash screen → Onboarding (3 lépés) → Szintfelmérő → Főképernyő
- 1A lecke teljes egészében, mind a 10 feladattípussal
- Valóban kitölthető feladatok (kattintás, begépelés)
- Könyv mód (📖 modal)
- Statisztika, Ismétlés, Profil tabok
- Színkódolás: PINK = szókincs, ZÖLD = nyelvtan, KÉK = kommunikáció

### 5. TANANYAG-DIGITALIZÁLÁSI ÚTMUTATÓ (PlayENG_Tananyag_Utmutato.docx)
Hogyan lesz 3 könyvből (Mondatalkotás + Speaking + Oxford szószedet) app tartalom:
- 5 lépés: Master Vocabulary → Grammar JSON → Feladatok megírása → Párbeszédek → Hanganyag
- Munkaterv: ~125–190 óra (Gréta 7 óra átnézés, Claude megírja az anyagot)
- Excel sablon struktúrák (vocabulary.xlsx, questions.xlsx, dialogues.xlsx)

---

## FONTOS DÖNTÉSEK (amiket Gréta meghozott)

### Feladattípusok: 12 → 10
| # | Típus | Megjegyzés |
|---|-------|------------|
| 1 | Szókincs bemutatás | Max 6-8 szó, TTS + lassított mód |
| 2 | Szókincs visszakérdezés | Magyar↔angol, 3 opció |
| 3 | Begépelés | Betűnkénti bevitel (Wordle-stílus), NEM szabad szövegmező |
| 4 | Nyelvtani magyarázat + Step 0 | ALAP szabály → EXTRA 1 könyv → EXTRA 2 hang |
| 5 | Mondatépítő | Alap + csapdás EGYBEN |
| 6 | Kiegészítés | Magyar kulcsszó NARANCSSÁRGÁN kiemelve |
| 7 | Két opció választás | Mindig magyarázat miért rossz |
| 8 | Párbeszéd | Max 2 helyes opció, 1 tipikus magyar hiba |
| 9 | Speaking | Ismétlés + fordítás + reakció |
| 10 | Activity | Rokon szavak minimális különbséggel (dog→meat, cat→milk) |

### Mottó és szlogenek:
- Fő: "Magyar fejjel, angol nyelven."
- Al: "A PlayENG módszerrel töredék idő alatt, magabiztosan érsz célba."
- Feature 1: "Nemcsak tanulsz — megtanulsz beszélni."
- Feature 2: "Anyanyelvi oktatóval gyakorolhatod az élő beszédet."
- Feature 3: "4× gyorsabb fejlődés."

### Motiváció: NEM XP!
- Szavak + feladatok számolása (127 szó, 3 feladat)
- Szint: ⭐⭐ Tanuló — Még 3 lecke a következő szintig
- Streak: 🔥 7 napja tanulsz
- Összehasonlítás: "Gyorsabban haladsz, mint a tanulók 68%-a!"

### Nyelvtani magyarázat 3 szintje:
1. ALAP (mindig látható): 2-3 soros szabály + Step 0 táblázat
2. EXTRA 1 — Könyv mód (📖): PNG oldalak + tanári hang szinkronban
3. EXTRA 2 — Hangos magyarázat (🔊): max 2 perc, önállóan is hallgatható

### Szintfelmérő:
- Részenként 1 perces gyorsteszt (5 kérdés)
- A LEGNEHEZEBB kérdéseket teszi fel (nem "cat"-et kérdez)
- Ha hibázik → onnan indul. Ha mindent tud → ismétlés.

### Ismétlési rendszer:
- SM-2 algoritmus: 1d → 3d → 7d → 18d → 45d (helyes) / vissza 1d (hibás)
- 3 forrás: hibás válasz + szóra kattintás (2× = bekerül) + lassú válasz
- 3 hely: Napi Gyorspróba (belépéskor) + Egység ismétlés + Leckébe beépített

### Teljes alak → Összevont alak:
- 1. kör: teljes alak (I cannot swim)
- 2. kör: összevont felismerés (I can't swim = I cannot swim)
- 3. kör: vegyes alkalmazás (kontextustól függ melyik kell)

---

## NYITOTT KÉRDÉSEK (Roland TODO)
Lásd: ROLAND_TODO.md

---

## FÁJLOK EBBEN A MAPPÁBAN

| Fájl | Mi ez? | Prioritás |
|------|--------|-----------|
| PlayENG_APP_INFO_v4.docx | **LEGFONTOSABB** — teljes specifikáció, ebből dolgozik a programozó | ★★★ |
| PlayENG_Prototype.html | Interaktív design prototípus, böngészőben nyitható | ★★★ |
| ROLAND_TODO.md | Döntések és következő lépések listája | ★★★ |
| SESSION_SUMMARY.md | Ez a fájl — a mai munka összefoglalója | ★★ |
| PlayENG_Kiertekeles.docx | Eredeti kiértékelés 27 pontban | ★★ |
| PlayENG_Tananyag_Utmutato.docx | Hogyan lesz 3 könyvből app tartalom | ★★ |
| PlayENG_Design_Guide.docx | Vizuális tervezési irányelvek | ★ |
| PlayENG_APP_INFO_v3.docx | Korábbi verzió (v4 helyettesíti) | archív |
