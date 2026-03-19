# PlayENG 3000 — CLAUDE.md

## Projekt
Online angol nyelvtanuló platform az Oxford 3000 leggyakrabban használt szó elsajátítására.
Készítette: **Gréta** (PlayENG módszer, 10 év angol tanítási tapasztalat).
Roland (a férje) kezeli az infrastruktúrát, szervereket, deploymentet.

## TE KI VAGY
- Roland a programozó — technikai nyelven kommunikál
- Gréta NEM programozó — természetes nyelven, vibe coding módszerrel dolgozik
- Ha Gréta dolgozik: mindent magyarul, egyszerűen, kerüld a szakzsargont

---

## GITHUB & HOZZÁFÉRÉS
- **Repo URL**: https://github.com/rpallagi/3000
- **GitHub user**: rpallagi

## SZERVER & INFRASTRUKTÚRA
- **Élő app URL**: http://192.168.8.235:5008 (otthoni hálózaton)
- **Unraid NAS LAN IP**: 192.168.8.235
- **Unraid NAS Tailscale IP**: 100.71.98.69
- **Projekt helye Unraid-en**: /tmp/3000/

## DOCKER CONTAINERS (Unraid-en futnak)
- `playeng-frontend` → port 5008 (a webes felület)
- `playeng-backend` → port 5000 (belső API)
- `playeng-db` → PostgreSQL 16 adatbázis

## ADATBÁZIS
- **Motor**: PostgreSQL 16
- **DB neve**: playeng / **User**: playeng
- **Host** (Dockeren belül): db:5432

## FÁJLRENDSZER
- `frontend/` — React app forrása
- `backend/` — Flask API forrása
- `backend/data/oxford3000.json` — 973 szó adatbázis
- `docs/PlayENG APP.docx` — eredeti app specifikáció
- `docs/cowork-2026-03-19/` — **Greta v4 specifikáció** (a LEGFRISSEBB!)
- `docker-compose.yml` — Docker konfiguráció

## FUTTATÓ PARANCSOK (helyi fejlesztés)
```bash
cd frontend && npm start              # → http://localhost:3001
cd backend && python3 -m flask run --port 5001   # → http://localhost:5001
```

---

## TECH STACK
- **Frontend**: React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- **Backend**: Python Flask + PostgreSQL 16
- **Deploy**: Docker Compose

## STRUKTÚRA (V4 — Greta cowork session alapján)
- 972 szó, **20 nyelvtani egység (1A–5C)**, 7 szituáció
- **10 feladattípus** (nem 4!)
- SM-2 ismétlési rendszer
- Szintfelmérő (5 részes)
- Teljes A1 + A2 alapjai

## DESIGN IRÁNYELVEK
- Mobil-először (telefon az elsődleges platform)
- Apple-stílusú kártyás design, SVG ikonok, NINCS emoji
- **Színkódolás**: Pink (#E91E63) = szókincs, Zöld (#4CAF50) = nyelvtan, Kék (#1565C0) = kommunikáció, Narancs (#FF9800) = activity/kiemelés
- **Mottó**: "Magyar fejjel, angol nyelven."

## PLAYENG MÓDSZER (10 feladattípus — v4)
1. Szókincs bemutatás (kép + szó + TTS normál/lassított)
2. Szókincs visszakérdezés (magyar↔angol, 3 opció)
3. Begépelés (Wordle-stílus, betűnkénti, 48×56px)
4. Nyelvtani magyarázat + Step 0 (3 szint: alap + könyv + hang)
5. Mondatépítő (alap + csapdás szavak)
6. Kiegészítés (kulcsszó narancssárgán kiemelve)
7. Két opció választás (mindig magyarázat miért rossz)
8. Párbeszéd (max 2 helyes opció, 1 tipikus magyar hiba)
9. Speaking (ismétlés + fordítás + reakció)
10. Activity (rokon szavak, párban játszható)

## LECKE FOLYAMAT
Szókincs bemutatás → Visszakérdezés → Begépelés → Nyelvtan → Mondatépítő → Kiegészítés → Két opció → Párbeszéd → Speaking → Activity → Eredmények

## FONTOS GRETA DÖNTÉSEK
- Motiváció: NEM XP! Hanem "127 szót tanultál", "3 feladat kész"
- Teljes alak → összevont: 3 körben (I cannot → I can't felismerés → vegyes)
- Nyelvtani szabály: ELŐSZÖR alap → UTÁNA kivételek
- 🔊 normál + 🐌 lassított mód minden hangnál
- Szintfelmérő: LEGNEHEZEBB kérdések, nem "cat"-et kérdez
- SM-2 ismétlés: 1d → 3d → 7d → 18d → 45d (helyes) / vissza 1d (hibás)

## REFERENCIA DOKUMENTUMOK
- `docs/cowork-2026-03-19/PlayENG_APP_INFO_v4.docx` — **LEGFONTOSABB**: teljes v4 spec
- `docs/cowork-2026-03-19/PlayENG_Prototype.html` — interaktív design prototípus
- `docs/cowork-2026-03-19/PlayENG_Kiertekeles.docx` — kiértékelés 27 pontban
- `docs/cowork-2026-03-19/PlayENG_Tananyag_Utmutato.docx` — digitalizálási útmutató
- `docs/cowork-2026-03-19/SESSION_SUMMARY.md` — session összefoglaló
- `docs/cowork-2026-03-19/ROLAND_TODO.md` — döntések és teendők
- `docs/PlayENG APP.docx` — eredeti spec (pontozás részletek)
- `docs/1_Okoskonyv_Mondatalkotas G 0304.pdf` — nyelvtan könyv
- `docs/1_Okoskonyv_Speaking.pdf` — szókincs/beszéd könyv
- `plan.integration.md` — implementációs terv
