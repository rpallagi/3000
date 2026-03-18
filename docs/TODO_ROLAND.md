# TODO — Roland

## Beállítás a production indulás előtt

### 1. `.env` fájl létrehozása az Unraid szerveren
```bash
ssh root@192.168.8.235
cd /tmp/3000
cp .env.example .env
nano .env   # kitölteni az értékeket
```

### 2. Google OAuth beállítása
- Menj ide: https://console.cloud.google.com/apis/credentials
- Hozz létre egy "OAuth 2.0 Client ID"-t (Web application)
- Authorized JavaScript origins: `https://angolozzunk.hu`
- Authorized redirect URIs: `https://angolozzunk.hu/api/auth/google`
- Másold be a Client ID-t és Secret-et a `.env` fájlba

### 3. Facebook Login beállítása
- Menj ide: https://developers.facebook.com/apps
- Hozz létre egy új appot
- Add hozzá a "Facebook Login" terméket
- Valid OAuth redirect URI: `https://angolozzunk.hu`
- Másold be az App ID-t és Secret-et a `.env` fájlba

### 4. Apple Sign In beállítása
- Menj ide: https://developer.apple.com
- Regisztráld a Service ID-t az angolozzunk.hu domainnel
- Másold be a Client ID-t, Team ID-t, Key ID-t a `.env` fájlba

### 5. Cloudflare Tunnel beállítása
```bash
ssh root@192.168.8.235

# Telepítés (ha még nincs)
# Letöltés: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

# Bejelentkezés
cloudflared tunnel login

# Tunnel létrehozása
cloudflared tunnel create playeng

# DNS rekord hozzáadása
cloudflared tunnel route dns playeng angolozzunk.hu
cloudflared tunnel route dns playeng www.angolozzunk.hu

# Config másolása (szerkeszd a tunnel ID-t!)
cp /tmp/3000/cloudflared-config.yml /root/.cloudflared/config.yml
nano /root/.cloudflared/config.yml

# Indítás
cloudflared tunnel run playeng

# Autostart
cloudflared service install
```

### 6. OTP SimplePay regisztráció
- Menj ide: https://simplepay.hu/fejlesztoknek
- Regisztrálj kereskedőként
- Sandbox (teszt) módban indulj
- Másold be a Merchant ID-t és Secret Key-t a `.env` fájlba

### 7. Claude API kulcs
- Menj ide: https://console.anthropic.com
- Hozz létre egy API kulcsot
- Másold be a `.env` fájlba: `CLAUDE_API_KEY=sk-ant-...`

### 8. Erős jelszavak generálása
```bash
# DB jelszó
openssl rand -hex 32

# Flask secret
openssl rand -hex 32

# JWT secret
openssl rand -hex 32
```

### 9. Deploy
```bash
ssh root@192.168.8.235
cd /tmp/3000
git pull
docker compose up --build -d
```

---

## Később (nice-to-have)
- [ ] SimplePay sandbox → éles váltás (`SIMPLEPAY_SANDBOX=false`)
- [ ] Facebook + Apple login tesztelése
- [ ] WebAuthn (Face ID) beállítása bejelentkezett felhasználóknak
- [ ] 2FA (Google Authenticator) opció
- [ ] Adatvédelmi szabályzat + ÁSZF oldalak
- [ ] Analytics (pl. Plausible — privacy-friendly)
