# PlayENG 3000 — CLAUDE.md

## Projekt
Online angol nyelvtanuló platform az Oxford 3000 leggyakrabban használt szó elsajátítására.
Készítette: **Gréta** (PlayENG módszer, 10 év angol tanítási tapasztalat).
Roland (a férje) kezeli az infrastruktúrát, szervereket, deploymentet.

## TE KI VAGY (Gréta Claude Code-ja)
- Gréta NEM programozó — természetes nyelven kommunikál, vibe coding módszerrel dolgozik
- Mindent magyarul magyarázz, egyszerű nyelven, kerüld a szakzsargont
- Ha kódot változtatsz, mindig a `dev` branch-re dolgozz — SOHA ne pushölj `main`-re
- Roland kezeli a `main` branch-et és a produkciós deployt
- Ha valami összetett technikai dolog felmerül, jelezd Rolandnak is

> 🔐 **Tokenek és jelszavak**: lásd a Gréta Mac-jén lévő `~/3000/SECRETS.md` fájlban,
> vagy az Unraid Google Drive-on: `/mnt/user/GoogleDrive/Greta/3000/docs/CLAUDE_FULL.md`

---

## GITHUB & HOZZÁFÉRÉS
- **Repo URL**: https://github.com/rpallagi/3000
- **GitHub user**: rpallagi
- **Token**: lásd SECRETS.md

## SZERVER & INFRASTRUKTÚRA
- **Élő app URL**: http://192.168.8.235:5008 (otthoni hálózaton)
- **Unraid NAS LAN IP**: 192.168.8.235
- **Unraid NAS Tailscale IP**: 100.71.98.69
- **SSH**: root@100.71.98.69 (jelszó: SECRETS.md-ben)
- **Projekt helye Unraid-en**: /tmp/3000/

## DOCKER CONTAINERS (Unraid-en futnak)
- `playeng-frontend` → port 5008 (a webes felület)
- `playeng-backend` → port 5000 (belső API)
- `playeng-db` → PostgreSQL 16 adatbázis
- Deploy parancs (csak Roland futtatja):
```
ssh root@100.71.98.69 'cd /tmp/3000 && git pull && docker compose up --build -d'
```

## ADATBÁZIS
- **Motor**: PostgreSQL 16
- **DB neve**: playeng / **User**: playeng
- **Jelszó**: SECRETS.md-ben
- **Host** (Dockeren belül): db:5432

## FÁJLRENDSZER
- `frontend/` — React app forrása
- `backend/` — Flask API forrása
- `backend/data/oxford3000.json` — 973 szó adatbázis
- `docs/PlayENG APP.docx` — app specifikáció
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

## GIT BRANCH STRATÉGIA
- `main` → éles verzió, Roland kezeli — **NE érintsd**
- `dev` → Gréta fejlesztési ága — **IDE dolgozz mindig**

## STRUKTÚRA
- 973 szó, 23 tematikus fejezet, 6 szint
- 31 párbeszéd rangsorolt válaszokkal

## DESIGN IRÁNYELVEK
- Mobil-először (telefon az elsődleges platform)
- Apple-stílusú kártyás design, SVG ikonok, NINCS emoji
- PlayENG branding: kék (#2ea3f2), Open Sans font

## PLAYENG MÓDSZER (4 feladattípus)
1. Választós kiegészítő (multiple choice) — pontozás: 5/2/1/0
2. Mondatfordítás (drag-and-drop) — pontozás: 8/5/3/1
3. Kiejtés (Web Speech API) — pontozás: 8/5/3/1
4. Párbeszéd (role-play) — pontozás: 8/5/3/0

## LECKE FOLYAMAT
Megfigyelés → Választós → Mondatépítés → Kiejtés → Párbeszéd → Eredmények

---

## 🆘 HA A CLAUDE APP BEFAGY — MIT CSINÁLJ?

1. Nyisd meg a **Terminált** (Mac: Spotlight → Terminal)
2. Navigálj a projekt mappájába: `cd ~/3000`
3. Írd be: `claude`
4. **Első mondatod** (copy-paste ezt):

> *"Olvasd el a CLAUDE.md-t. Gréta vagyok, a PlayENG app fejlesztője. [Írd ide: min dolgoztál utoljára, pl. 'a kiejtés feladaton voltunk, a mikrofon gombot javítottuk']"*

---

## ✅ GRÉTÁNAK: TIPPEK A HALADÁS MEGŐRZÉSÉHEZ

### Milyen gyakran ments?
- **Minden 30 percben**: mondd Claude-nak → *"Ments el mindent és pushöld fel a dev branch-re"*
- Ha valami JÓL MŰKÖDIK: azonnal ments mielőtt tovább mennél
- Nap végén: mindig ments

### Mire figyelj?
- **Egyszerre egy dolgot** változtass — könnyebb visszacsinálni ha nem jön be
- **Ha valami eltört**: *"Csináld vissza az utolsó változtatást"*
- **Mondd pontosan** mi a cél: ne "nem jó", hanem "a gomb túl kicsi"
- Képernyőkép küldés sokat segít

### Ne aggódj ha:
- Nem érted a kódot — nem kell érteni
- Valami nem sikerül elsőre — normális
- Elfelejtettél valamit — mindig el tudod mondani újra
