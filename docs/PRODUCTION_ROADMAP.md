# PlayENG 3000 — Production Roadmap

## Overview

Deploy `angolozzunk.hu` as a subscription-based English learning platform with secure authentication, billing, and AI tutoring.

**Server:** Unraid (192.168.8.235)
**Domain:** angolozzunk.hu
**Tunnel:** Cloudflare Tunnel (free SSL, DDoS protection)
**Utolsó frissítés:** 2026-03-18

---

## Állapot összefoglaló

### KÉSZ (Implementálva)

| # | Feature | Státusz | Megjegyzés |
|---|---------|---------|------------|
| 1 | **Frontend (React + Vite + Tailwind)** | KÉSZ | Mobil-első design, Apple-stílusú kártyák |
| 2 | **Backend (Flask + PostgreSQL)** | KÉSZ | API-k, modellek, blueprintek mind megvannak |
| 3 | **Docker Compose (3 szolgáltatás)** | KÉSZ | db + backend + frontend, port 5008 |
| 4 | **Oxford 3000 adatbázis** | KÉSZ | 973 szó, 23 fejezet, 6 szint, 31 párbeszéd |
| 5 | **Step 0: Megfigyelés** | KÉSZ | Kötelező meghallgatás, auto-play, lock gomb |
| 6 | **1. feladat: Választós (Cloze)** | KÉSZ | Mondat + hiányzó szó, 4 opció, 30mp hint, 5/2/1/0 pont |
| 7 | **2. feladat: Mondatépítés** | KÉSZ | Drag-drop + distractorok, 8/5/3/1 pont |
| 8 | **3. feladat: Kiejtés** | KÉSZ | Kötelező listen-first, magyar tippek (30+), mic lock, 8/5/3/1 pont |
| 9 | **4. feladat: Párbeszéd** | KÉSZ | Rangsorolt válaszok, magyarázatok, 8/5/3/0 pont |
| 10 | **Eredmény-képernyő** | KÉSZ | Százalék, progress ring, gyenge szavak |
| 11 | **Hibaszótár** | KÉSZ | /error-dictionary oldal, flashcard gyakorlás |
| 12 | **Napi kihívás** | KÉSZ | 30mp mondatfordítás, +15 pont, streak |
| 13 | **Hang/Néma mód** | KÉSZ | Header toggle, néma módban kiejtés kihagyva |
| 14 | **Sötét mód** | KÉSZ | Header toggle |
| 15 | **AI visszajelzés (lecke végén)** | KÉSZ | Claude Haiku, személyes magyar feedback |
| 16 | **Progress tracking (helyi)** | KÉSZ | localStorage, streak, error dict |
| 17 | **OAuth kód (Google/Facebook/Apple)** | KÉSZ | Kód megvan, kulcsok kellenek (Roland) |
| 18 | **WebAuthn kód (Face ID)** | KÉSZ | Kód megvan, config kell |
| 19 | **SimplePay kód (fizetés)** | KÉSZ | Kód megvan, merchant reg kell |
| 20 | **AI Tutor kód (chat)** | KÉSZ | Kód megvan, API key kell |
| 21 | **Security middleware** | KÉSZ | Rate limiting, CORS, CSP, Talisman |
| 22 | **Dev-login (teszt)** | KÉSZ | /api/auth/dev-login, OAuth nélkül is működik |

### ROLAND FELADATA (külső beállítások)

| # | Feladat | Prioritás | Idő |
|---|---------|-----------|-----|
| R1 | `.env` fájl létrehozása az Unraid-en | KRITIKUS | 10 perc |
| R2 | Google OAuth Client ID + Secret | MAGAS | 15 perc |
| R3 | Cloudflare Tunnel beállítás (angolozzunk.hu) | MAGAS | 30 perc |
| R4 | Claude API kulcs (console.anthropic.com) | KÖZEPES | 5 perc |
| R5 | Facebook App ID + Secret | ALACSONY | 15 perc |
| R6 | Apple Sign-In beállítás | ALACSONY | 20 perc |
| R7 | SimplePay merchant regisztráció | ALACSONY | 30 perc |

### FEJLESZTÉS

| # | Feature | Státusz | Megjegyzés |
|---|---------|---------|------------|
| F1 | **Fejezet teszt** (chapter test) — záró teszt +50 pont | KÉSZ | 10 random szó, lessonId=0, chapter page-en jelenik meg |
| F2 | **Progress sync szerverre** — localStorage → PostgreSQL | KÉSZ | saveLessonResult() auto-sync, syncProgressFromServer() merge |
| F3 | **Gyenge szavak célzott gyakorlás** — Hibaszótárból task indítás | KÉSZ | /weak-words-practice — teljes PlayENG flow (choice+sentence+pronunciation) |
| F4 | **Streak vizualizáció** — naptár, badge, motivációs üzenetek | KÉSZ | Főoldalon 7 napos naptár + motivációs üzenetek (1-30+ nap) |
| F5 | **AI Tutor chat UI javítás** — beszéd + válasz, chapter context | HÁTRAVAN | |
| F6 | **PWA telepítés** — manifest, service worker, offline cache | HÁTRAVAN | |
| F7 | **Analitika** — Plausible (GDPR-kompatibilis) | HÁTRAVAN | |
| F8 | **ÁSZF + Adatvédelem** oldalak | KÉSZ | /terms + /privacy — GDPR, footer linkek |
| F9 | **Szóspecifikus magyar kiejtési tippek** | HÁTRAVAN | PronunciationTask-ban van hardcoded tipp, de szóspecifikus nincs |

---

## Architecture

```
                    Internet
                       │
              Cloudflare Tunnel (SSL + DDoS)
                       │
                   angolozzunk.hu
                       │
              ┌────────┴────────┐
              │   Nginx (port 80)│
              └────────┬────────┘
                ┌──────┴──────┐
                │             │
         React SPA      Flask API
         (static)     ┌─────┴──────┐
                      │            │
                 PostgreSQL   Claude API
                 (users,      (AI tutor +
                 progress,    feedback)
                 billing)
```

---

## PlayENG módszertan (implementált)

### Lecke folyamat
```
Step 0: Megfigyelés (kötelező meghallgatás)     ← KÉSZ
  ↓
Step 1: Választós (cloze — mondat + hiányzó szó)  ← KÉSZ
  ↓
Step 2: Mondatépítés (drag-drop + distractorok)   ← KÉSZ
  ↓
Step 3: Kiejtés (listen-first + magyar tippek)     ← KÉSZ
  ↓
Step 4: Párbeszéd (rangsorolt válaszok)            ← KÉSZ
  ↓
Eredmények (AI feedback + gyenge szavak)           ← KÉSZ
  ↓
Hibaszótár (visszahozza ami nehéz)                 ← KÉSZ
  ↓
Napi kihívás (30mp, +15 pont)                      ← KÉSZ
```

### Pontozás
| Feladat | Alap pont | Max bónusz |
|---------|-----------|------------|
| Választós (cloze) | +5 | +10 (sorozat) |
| Mondatépítés | +8 | +10 (sorozat) |
| Kiejtés | +8 | +10 (sorozat) |
| Párbeszéd | +8/sor | +15 (mind tökéletes) |
| Napi kihívás | +15 | — |
| Fejezet teszt | +50 | — |

---

## Phase 1: Database & Security Foundation — KÉSZ

### PostgreSQL — KÉSZ
- Docker Compose service alongside backend + frontend
- SQLAlchemy ORM + Flask-Migrate for schema management
- Tables: users, subscriptions, progress, sessions

### Security Middleware — KÉSZ
| Protection | Tool | Purpose |
|------------|------|---------|
| Rate limiting | Flask-Limiter | 60 req/min per IP |
| CORS lockdown | flask-cors | Only angolozzunk.hu |
| Input validation | Marshmallow/Zod | Validate all params |
| Security headers | Flask-Talisman | HSTS, CSP, X-Frame-Options |
| CSRF protection | Flask-WTF | Token-based CSRF |
| SQL injection | SQLAlchemy | Parameterized queries (automatic) |
| Debug off | Flask config | `debug=False` in production |

---

## Phase 2: Authentication — KÓD KÉSZ, CONFIG KELL

### Social Login (OAuth 2.0)
| Provider | What user sees | Státusz |
|----------|---------------|---------|
| Google | "Sign in with Google" button | Kód kész, kulcs kell (R2) |
| Facebook | "Continue with Facebook" button | Kód kész, kulcs kell (R5) |
| Apple | "Sign in with Apple" button | Kód kész, kulcs kell (R6) |

### Dev-login — KÉSZ
- Teszt belépés OAuth nélkül: `/api/auth/dev-login`
- Automatikusan elérhető ha nincs Google OAuth config

### Biometric "Remember Me" (WebAuthn) — KÓD KÉSZ
- Touch ID / Face ID via browser WebAuthn API
- `webauthn` (backend) + frontend integration

---

## Phase 3: Subscription & Billing — KÓD KÉSZ, REG KELL

### OTP SimplePay (Hungarian payment gateway)

| Tier | Access | Price |
|------|--------|-------|
| Free (Ingyenes) | Level 1 — Chapters 1-4 | 0 Ft |
| Premium (Prémium) | All 6 levels + AI tutor | ~2,990 Ft/hó |

---

## Phase 4: AI Integration — RÉSZBEN KÉSZ

| Feature | Státusz |
|---------|---------|
| AI Tutor chat (Claude Haiku) | Kód kész, API key kell (R4) |
| AI lecke-feedback (eredmény után) | KÉSZ (backend + frontend) |
| AI kiejtés-feedback | Kód kész, API key kell |

---

## Phase 5: Cloudflare Tunnel + Domain — ROLAND FELADATA (R3)

### Setup on Unraid
```bash
cloudflared tunnel create playeng
# Configure tunnel for angolozzunk.hu → localhost:5008
cloudflared service install
```

---

## Environment Variables (.env)

```env
# Database
DB_PASSWORD=<strong-random-password>

# Flask
SECRET_KEY=<strong-random-secret>

# Google OAuth
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>

# Facebook OAuth
FACEBOOK_APP_ID=<from-facebook-developers>
FACEBOOK_APP_SECRET=<from-facebook-developers>

# Apple OAuth
APPLE_CLIENT_ID=<from-apple-developer>
APPLE_TEAM_ID=<from-apple-developer>
APPLE_KEY_ID=<from-apple-developer>

# OTP SimplePay
SIMPLEPAY_MERCHANT_ID=<from-simplepay>
SIMPLEPAY_SECRET_KEY=<from-simplepay>

# Claude API (AI Tutor + Feedback)
CLAUDE_API_KEY=<from-console.anthropic.com>
```

---

## Security Best Practices

- All secrets in `.env` file (never committed to git)
- HTTPS only via Cloudflare Tunnel
- Parameterized SQL queries (SQLAlchemy)
- JWT tokens with short expiry + refresh tokens
- Rate limiting on all endpoints
- CORS restricted to angolozzunk.hu
- CSP headers prevent XSS
- Input validation on all user input
- WebAuthn for passwordless auth (phishing-resistant)
- Subscription validation server-side (can't bypass in frontend)
- API keys never exposed to frontend
