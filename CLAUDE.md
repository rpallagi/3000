# PlayENG 3000 — CLAUDE.md

## Projekt
Online angol nyelvtanuló platform az Oxford 3000 leggyakrabban használt szó elsajátítására.
Készítette: **Gréta** (PlayENG módszer, 10+ év angol tanítási tapasztalat).
Infrastruktúra: **Roland** (Gréta férje — szerverek, deploy, fejlesztés).

## KI VAGY TE?
Két ember dolgozik ezen a projekten Claude-dal:

### GRÉTA (Cowork vagy Claude Code)
- NEM programozó — természetes nyelven kommunikál
- A tananyag, a módszer és a feladatok az ő szakterülete
- Mindent magyarul magyarázz, egyszerű nyelven
- Ha kódot változtatsz: **MINDIG `dev` branch-re** — SOHA ne pushölj `main`-re
- Ha technikai dolog merül fel, jelezd Rolandnak

### ROLAND (Claude Code)
- Kezeli az infrastruktúrát, kódolást, deploy-t
- Technikai döntéseket ő hozza
- A `main` branch-et ő kezeli

> 🔐 **Tokenek és jelszavak**: lásd az Unraid SMB share-en:
> `/mnt/user/GoogleDrive/Greta/3000/docs/CLAUDE_FULL.md`
> SOHA ne írj tokent vagy jelszót ebbe a fájlba!

---

## GIT SZABÁLYOK
- **Repo**: https://github.com/rpallagi/3000 (PRIVÁT)
- **main** → éles verzió, CSAK Roland módosítja
- **dev** → fejlesztési ág, IDE dolgozz mindig
- SECRETS.md, tokenek, jelszavak → .gitignore-ban vannak, NE commitold!

## SZERVER & INFRASTRUKTÚRA
- **Élő app**: http://192.168.8.235:5008 (Unraid, otthoni LAN)
- **Unraid Tailscale**: 100.71.98.69
- **Projekt helye Unraid-en**: /tmp/3000/
- **Jelszavak**: lásd SECRETS (Unraid SMB share)

## DOCKER (Unraid)
- `playeng-frontend` → port 5008
- `playeng-backend` → port 5000
- `playeng-db` → PostgreSQL 16

## TECH STACK
- **Frontend**: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- **Backend**: Python Flask + PostgreSQL 16
- **Deploy**: Docker Compose
- **Dev**: `npm start` (port 3001) / `flask run --port 5001`

---

## FÁJLSTRUKTÚRA

```
3000/
├── CLAUDE.md              ← EZ A FÁJL (olvasd el először!)
├── frontend/              ← React app
├── backend/               ← Flask API
│   └── data/oxford3000.json  ← 973 szó adatbázis
├── docs/                  ← Forrásanyagok
│   ├── PlayENG APP.docx   ← Régi specifikáció (Roland verzió)
│   ├── OXFORD_A1_*.docx   ← Oxford szószedet + mondatok + párbeszédek
│   ├── 1_Okoskonyv_*.pdf  ← Gréta könyvei (Mondatalkotás + Speaking)
│   └── cowork-2026-03-19/ ← ★ GRÉTA COWORK SESSION EREDMÉNYEI
│       ├── PlayENG_APP_INFO_v4.docx  ← ★★★ ÚJ SPECIFIKÁCIÓ (v4.2)
│       ├── PlayENG_Prototype.html    ← ★★★ DESIGN PROTOTÍPUS (böngészőben nyitható)
│       ├── ROLAND_TODO.md            ← ★★★ TEENDŐK LISTÁJA
│       ├── SESSION_SUMMARY.md        ← Mai session összefoglalója
│       ├── ARTIFACTS.md              ← Fájlok leírása
│       ├── PlayENG_Kiertekeles.docx  ← Eredeti terv kiértékelése
│       ├── PlayENG_Tananyag_Utmutato.docx ← Digitalizálási útmutató
│       └── PlayENG_Design_Guide.docx ← Vizuális irányelvek
├── scripts/               ← Konverter scriptek
└── docker-compose.yml
```

---

## PLAYENG MÓDSZER (FRISSÍTVE — 2026.03.19 Cowork alapján)

### 10 feladattípus (régi 4 helyett):
1. Szókincs bemutatás — passzív hallgatás, max 6-8 szó
2. Szókincs visszakérdezés — magyar↔angol, 3 opció
3. Begépelés — betűnkénti bevitel (Wordle-stílus!), NEM szabad szövegmező
4. Nyelvtani magyarázat + Step 0 — ALAP szabály + EXTRA könyv + EXTRA hang
5. Mondatépítő — szavak sorrendbe + csapda szó
6. Kiegészítés — hiányzó szó, magyar kulcsszó NARANCSSÁRGÁN (#FF9800) kiemelve
7. Két opció választás — mindig magyarázat miért rossz
8. Párbeszéd kiegészítés — max 2 helyes, 1 tipikus magyar hiba
9. Speaking — ismétlés + fordítás + reakció
10. Activity — rokon szavak minimális különbséggel (dog→meat, cat→milk)

### Lecke flow:
bemutatás → visszakérdezés → begépelés → nyelvtan → mondatépítő → kiegészítés → választás → párbeszéd → speaking → activity
Egy lecke ~20-25 perc

### Mottó:
"Magyar fejjel, angol nyelven."
"Nemcsak tanulsz — megtanulsz beszélni."
"4× gyorsabb fejlődés."

### Design irányelvek (FRISSÍTVE):
- Zöld (#4CAF50) + Pink (#E91E63) — a PlayENG logó színei
- Színkódolás: PINK = szókincs, ZÖLD = nyelvtan, KÉK = kommunikáció, NARANCS = activity
- Motiváció: NEM XP! Hanem szavak/feladatok/szint emberi nyelven
- "fejlesztettük" (MI), nem "fejlesztették" (ŐK)

---

## FONTOS DÖNTÉSEK (2026.03.19 session)

A teljes lista: `docs/cowork-2026-03-19/SESSION_SUMMARY.md`

### Tananyag javítások:
- 1A: a/an gyakorló főnévlista hozzáadva (university!, hour!)
- 1C: megjelenés/személyiség áthelyezve → 3D
- 4C: gyakorisági határozószók áthelyezve → 2E
- 4D: hiányzott, visszaadva (Food/Drinks)
- 12 feladattípus → 10 (összevonások)

### CEFR lefedettség:
- **A1: ~149%** (teljes, bőven meghaladja a minimumot)
- **A2: ~53%** (részleges — nyelvtan hiányos, szókincs OK)
- **B1: ~10-15%** (nem támogatott — ez egy másik fázis lenne)

### Elsajátítási idő:
- **130–185 óra** aktív tanulás
- Napi 10 perccel: ~11 hónap
- Napi 20 perccel: ~6 hónap

---

## LLM WORKFLOW — HOGYAN DOLGOZZUNK?

### Két fejlesztő, két kontextus:
```
GRÉTA (tartalom, módszer)          ROLAND (kód, infrastruktúra)
        ↓                                    ↓
    Cowork / Claude Code              Claude Code
        ↓                                    ↓
    docs/cowork-DÁTUM/                frontend/ + backend/
        ↓                                    ↓
    dev branch                        dev branch
        ↓                                    ↓
         ←←← Roland review →→→
                   ↓
              main branch (deploy)
```

### Gréta session indítása:
1. Nyisd meg a Claude-ot (Cowork vagy Terminal: `cd ~/Desktop/3000 && claude`)
2. Első mondat: "Olvasd el a CLAUDE.md-t. Gréta vagyok. [mit csinálsz ma]"
3. Minden 30 percben: "Ments el és pushöld a dev-re"
4. Session végén: készíts SESSION_SUMMARY.md-t a docs/cowork-DÁTUM/ mappába

### Roland session indítása:
1. `cd ~/Desktop/3000 && git checkout dev && git pull && claude`
2. Első mondat: "Olvasd el a CLAUDE.md-t. Roland vagyok. [feladat]"
3. Nézd meg a `docs/cowork-*` mappákat — Gréta újdonságai ott vannak
4. Ha production-ready: merge dev → main, deploy

### Fontos fájlok az LLM számára:
- **CLAUDE.md** — ez a fájl, MINDIG olvasd el először
- **docs/cowork-2026-03-19/SESSION_SUMMARY.md** — legfrissebb session eredmények
- **docs/cowork-2026-03-19/PlayENG_APP_INFO_v4.docx** — aktuális specifikáció
- **docs/cowork-2026-03-19/ROLAND_TODO.md** — nyitott kérdések, döntések
- **backend/data/oxford3000.json** — szóadatbázis

---

## ✅ TIPPEK

### Grétának:
- Egyszerre egy dolgot változtass
- Ha valami eltört: "Csináld vissza az utolsó változtatást"
- Képernyőkép küldés sokat segít
- Ne aggódj ha nem érted a kódot — nem kell érteni

### Rolandnak:
- Gréta session-jei a docs/cowork-* mappákban vannak
- A SESSION_SUMMARY.md-ből megtudod mit csináltak
- A main-re SOHA ne pushölj közvetlenül — mindig dev → review → merge
