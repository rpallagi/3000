# Integrációs Terv: Dev Branch → Main

## Jelenlegi helyzet

### Main branch (bc14591)
- 9 commit: alap PlayENG platform
- React 18 + Vite + Tailwind frontend
- Flask backend
- 973 szó, 23 fejezet, 6 szint
- 4 feladattípus (choice, sentence building, pronunciation, dialogue)
- Docker deploy (port 5008)

### Dev branch (claude/deploy-app-to-web-lItXQ) — 11 extra commit
A main-re épít, és **rengeteg új feature-t** tartalmaz:

#### Kész és működő új funkciók:
1. **Auth rendszer** — OAuth (Google/Facebook/Apple), WebAuthn (Face ID), JWT tokenek, dev-login
2. **Progress sync** — localStorage + PostgreSQL szerver szinkron, merge logika (best score)
3. **Fejezet teszt** — 10 random szó/fejezet, +50 pont, lessonId=0
4. **Hibaszótár** — /error-dictionary, flashcard gyakorlás, villámkártyák
5. **Gyenge szavak célzott gyakorlás** — /weak-words-practice, teljes PlayENG flow
6. **Napi kihívás** — 30mp mondatfordítás, +15 pont, streak tracking
7. **AI visszajelzés** — Claude Haiku, lecke végén személyes magyar feedback
8. **AI Tutor** — interaktív angol társalgás, fejezet kontextussal
9. **Streak vizualizáció** — 7 napos naptár + motivációs üzenetek
10. **Sötét mód** — Light/Dark/System toggle
11. **Hang/Néma mód** — Header toggle
12. **PWA** — Service worker, manifest, offline cache, telepíthető
13. **Security middleware** — Rate limiting, CORS, CSP, Talisman
14. **SimplePay billing** — Magyar fizetési kapu (kód kész, reg kell)
15. **ÁSZF + Adatvédelem** — /terms, /privacy oldalak
16. **Kiejtési tippek** — 30+ hardcoded magyar tipp a pronunciation task-ban

#### Ami MÉG HIÁNYZIK (plan.md 6 lépés):
1. `progress.ts` bővítés — `getOverallStats()`, `getLastActivity()`
2. "Következő lecke" gomb — ResultsScreen-ben, lecke végén továbblépés
3. Progress dashboard — főoldal: "X/973 szó tanulva" + smart resume
4. Level + Chapter progress barok — vizuális haladás
5. Mobil bottom navigation — BottomNav.tsx (4 tab)
6. Streak javítás — 0 napos streak kezelés

---

## Implementációs terv (6 lépés)

### 1. lépés: `progress.ts` bővítés
**Fájl:** `frontend/src/utils/progress.ts`

Két új funkció hozzáadása:

```typescript
getOverallStats() → { totalWordsLearned: number, totalLessons: number, totalChapters: number }
```
- Végigmegy az összes `lessons` bejegyzésen a localStorage-ban
- Minden befejezett lecke = annyi szó (max 10/lecke)
- Megszámolja a befejezett leckéket és fejezeteket (ahol lessonId !== 0)

```typescript
getLastActivity() → { chapterId: number, lessonId: number, label: string } | null
```
- Megkeresi a legutóbb befejezett leckét (completedAt alapján)
- Kiszámolja a következő befejezetlen leckét
- Ha az adott fejezet kész → következő fejezet 1. leckéje
- Ha nincs progress → null

### 2. lépés: "Következő lecke" gomb a ResultsScreen-ben
**Fájlok:**
- `frontend/src/components/tasks/ResultsScreen.tsx` — új props: `nextUrl`, `nextLabel`
- `frontend/src/pages/PracticePage.tsx` — kiszámolja a next URL-t
- `frontend/src/pages/ChapterTestPage.tsx` — kiszámolja a next URL-t

Logika:
- PracticePage: Ha van még lecke → `/chapter/X/lesson/Y+1`, ha utolsó → `/chapter/X/test`
- ChapterTestPage: → `/chapter/X+1` (következő fejezet)
- ResultsScreen: Megjeleníti a "Következő" gombot az "Újra" és "Fejezet" mellett

### 3. lépés: Progress Dashboard a főoldalon
**Fájl:** `frontend/src/pages/Index.tsx`

Új szekció a Hero után, streak előtt:
- "X / 973 szó tanulva" — progress bar
- "Y lecke elvégezve"
- "Folytatás: [Chapter Name], [Lesson N]" — smart resume gomb
- Mindig látszik ha van bármilyen progress (nem kell belépés)

### 4. lépés: Level + Chapter progress barok
**Fájlok:**
- `frontend/src/pages/LevelPage.tsx` — szint fejléc: "X/Y szó tanulva · X/Y fejezet kész"
  - Chapter kártyákon: vékony progress bar (befejezett leckék / összes lecke)
- `frontend/src/pages/ChapterPage.tsx` — fejezet fejléc: "X/Y lecke kész · Z%"
  - Vizuális progress bar a cím alatt

### 5. lépés: Mobil Bottom Navigation
**Új fájl:** `frontend/src/components/BottomNav.tsx`

4 tab:
- Tanulás (Home ikon) → `/`
- Napi kihívás (Zap ikon) → `/daily`
- Hibaszótár (BookOpen ikon) → `/error-dictionary`
- Profil (User ikon) → `/login` (vagy profil oldal)

Fix pozíció alul, csak mobilon vastagabb, desktop-on is látszik de kisebb.
SVG ikonok (Lucide), aktív tab kiemelés PlayENG kékkel.

**Integrálás:** `frontend/src/App.tsx` — Routes mellé, `pb-16` safe area a content-hez.

### 6. lépés: Streak javítás
**Fájl:** `frontend/src/pages/Index.tsx` (103-170. sor)

Jelenlegi probléma: `if (streak <= 0) return null;` — 0 napnál nem mutat semmit.

Fix: 0 napnál is mutassa a streak kártyát:
- "Kezdd el a sorozatot ma!" üzenet
- Üres naptár (minden nap szürke)
- Motiváló design hogy elkezdjen tanulni

---

## Érintett fájlok összefoglalva
| Fájl | Művelet |
|------|---------|
| `frontend/src/utils/progress.ts` | Módosítás: +2 új funkció |
| `frontend/src/components/tasks/ResultsScreen.tsx` | Módosítás: +nextUrl/nextLabel props + gomb |
| `frontend/src/pages/PracticePage.tsx` | Módosítás: next URL számítás |
| `frontend/src/pages/ChapterTestPage.tsx` | Módosítás: next URL számítás |
| `frontend/src/pages/Index.tsx` | Módosítás: progress dashboard + streak fix |
| `frontend/src/pages/LevelPage.tsx` | Módosítás: progress bar fejlécben + kártyákon |
| `frontend/src/pages/ChapterPage.tsx` | Módosítás: progress bar fejlécben |
| `frontend/src/components/BottomNav.tsx` | **ÚJ fájl** |
| `frontend/src/App.tsx` | Módosítás: BottomNav integrálás |

## Megjegyzések
- Minden változás a dev branchen történik
- A design PlayENG stílusban marad (kék #2ea3f2, rounded cards, SVG ikonok, Open Sans)
- Mobile-first megközelítés
- Framer Motion animációk konzisztensen
- Nincs emoji, csak SVG ikonok (Lucide)
