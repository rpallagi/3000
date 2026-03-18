# PlayENG 3000 — Production Roadmap

## Overview

Deploy `angolozzunk.hu` as a subscription-based English learning platform with secure authentication, billing, and AI tutoring.

**Server:** Unraid (192.168.8.235)
**Domain:** angolozzunk.hu
**Tunnel:** Cloudflare Tunnel (free SSL, DDoS protection)

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
                 (users,      (AI tutor)
                 progress,
                 billing)
```

---

## Phase 1: Database & Security Foundation

### PostgreSQL
- Docker Compose service alongside backend + frontend
- SQLAlchemy ORM + Flask-Migrate for schema management
- Tables: users, subscriptions, progress, sessions

### Security Middleware
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

## Phase 2: Authentication

### Social Login (OAuth 2.0)
| Provider | What user sees |
|----------|---------------|
| Google | "Sign in with Google" button |
| Facebook | "Continue with Facebook" button |
| Apple | "Sign in with Apple" button |

**Library:** Authlib (Python OAuth client)

### 2FA (Two-Factor Authentication)
- TOTP via `pyotp` — Google Authenticator / Authy compatible
- QR code setup flow
- Optional SMS fallback (Twilio)

### Biometric "Remember Me" (WebAuthn / Passkeys)
- Touch ID / Face ID via browser WebAuthn API
- `py_webauthn` (backend) + `@simplewebauthn/browser` (frontend)
- User logs in once → enables biometric → auto-login on return
- No password needed, no daily login friction

---

## Phase 3: Subscription & Billing

### OTP SimplePay (Hungarian payment gateway)

| Tier | Access | Price |
|------|--------|-------|
| Free (Ingyenes) | Level 1 — Chapters 1-4 | 0 Ft |
| Premium (Prémium) | All 6 levels + AI tutor | ~2,990 Ft/hó |

**Flow:**
1. User hits Level 2 → "Upgrade to Premium" screen
2. Redirected to SimplePay checkout → pays with card
3. SimplePay IPN (callback) → backend marks user as premium
4. User returns → full access unlocked

**Integration:**
- SimplePay PHP/Python SDK
- IPN (Instant Payment Notification) webhook
- Recurring payments for monthly subscription
- Store subscription_status on user record

---

## Phase 4: AI Voice Tutor

### Web Speech API + Claude API

| Component | Tech |
|-----------|------|
| Listen to user | Web Speech API (SpeechRecognition) |
| Understand & respond | Claude API (Haiku — fast + cheap) |
| Speak back | Web Speech API (SpeechSynthesis) |

**How it works:**
1. User taps mic → Speech-to-Text captures what they say
2. Send transcription to backend → Claude API
3. Claude responds as English tutor (corrects grammar, suggests better words)
4. TTS reads Claude's response back
5. Conversation continues naturally

**Tutor persona:**
- Friendly, encouraging tone
- Knows the student's current chapter vocabulary
- Corrects gently, explains in simple English
- Can switch to Hungarian for explanations if needed
- Keeps responses short (1-2 sentences)

**Cost:** ~$0.01-0.05 per tutoring session (Claude Haiku)

---

## Phase 5: Cloudflare Tunnel + Domain

### Setup on Unraid
```bash
# Install cloudflared (if not already)
# Create tunnel
cloudflared tunnel create playeng

# Configure tunnel
cat > /root/.cloudflared/config.yml << 'EOF'
tunnel: <tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: angolozzunk.hu
    service: http://localhost:5008
  - hostname: www.angolozzunk.hu
    service: http://localhost:5008
  - service: http_status:404
EOF

# Run as service
cloudflared service install
```

### Cloudflare DNS
```
CNAME  angolozzunk.hu      → <tunnel-id>.cfargotunnel.com
CNAME  www.angolozzunk.hu  → <tunnel-id>.cfargotunnel.com
```

**Benefits:** Free SSL, DDoS protection, CDN caching, no ports exposed.

---

## Updated Docker Compose

```yaml
version: "3.8"
services:
  db:
    image: postgres:16-alpine
    container_name: playeng-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: playeng
      POSTGRES_USER: playeng
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    expose:
      - "5432"

  backend:
    build: ./backend
    container_name: playeng-backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://playeng:${DB_PASSWORD}@db:5432/playeng
      SECRET_KEY: ${SECRET_KEY}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      SIMPLEPAY_MERCHANT_ID: ${SIMPLEPAY_MERCHANT_ID}
      SIMPLEPAY_SECRET_KEY: ${SIMPLEPAY_SECRET_KEY}
      CLAUDE_API_KEY: ${CLAUDE_API_KEY}
    depends_on:
      - db
    expose:
      - "5000"

  frontend:
    build: ./frontend
    container_name: playeng-frontend
    restart: unless-stopped
    ports:
      - "5008:80"
    depends_on:
      - backend

volumes:
  pgdata:
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

# Claude API (AI Tutor)
CLAUDE_API_KEY=<from-console.anthropic.com>
```

---

## Implementation Order

| # | Phase | What |
|---|-------|------|
| 1 | Database | PostgreSQL + SQLAlchemy + user model |
| 2 | Security | Rate limiting, CORS, headers, validation |
| 3 | Google Login | OAuth 2.0 + JWT sessions |
| 4 | WebAuthn | Biometric remember me |
| 5 | Cloudflare Tunnel | angolozzunk.hu live |
| 6 | SimplePay | Subscription billing |
| 7 | Facebook + Apple login | Additional providers |
| 8 | 2FA | TOTP optional security |
| 9 | AI Voice Tutor | Claude-powered conversation |
| 10 | Progress sync | Server-side progress storage |

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
