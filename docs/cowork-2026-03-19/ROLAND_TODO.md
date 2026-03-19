# ROLAND TODO — PlayENG App

## FONTOS: GitHub token visszavonása!
- A chatben megosztott tokent (ghp_...) AZONNAL vond vissza: GitHub Settings → Developer settings → Personal access tokens → Delete
- Generálj újat, és SOHA ne oszd meg nyilvánosan

---

## Hol tartunk most?

### Elkészült dokumentumok (mnt/outputs/ mappában):
- `PlayENG_APP_INFO_v4.docx` — Teljes specifikáció (v4.2), 18 fejezet, 20 egység
- `PlayENG_Kiertekeles.docx` — Eredeti kiértékelés, 27 észrevétel
- `PlayENG_Tananyag_Utmutato.docx` — Hogyan lesz 3 könyvből app tartalom
- `PlayENG_Prototype.html` — Interaktív design prototípus (1A lecke)

### CEFR lefedettség:
- A1: ~149% (TELJES)
- A2: ~53% (részleges)
- B1: ~10-15% (nem támogatott)

---

## MI VAN HÁTRA — prioritás sorrendben

### 1. DÖNTÉSEK (Rolandra vár)
- [ ] Platform: web app VAGY mobil app VAGY mindkettő?
- [ ] Regisztráció: email+jelszó VAGY Google login VAGY mindkettő?
- [ ] Fizetős vagy ingyenes? Ha fizetős: egyszeri vagy előfizetés?
- [ ] Gender-alapú háttér: pink (nő) / zöld (férfi) — regisztrációnál kérdezzük?
- [ ] Anyanyelvi amerikai oktató: ki lesz az? Van már valaki?
- [ ] TTS szolgáltatás: Google TTS (olcsó) vagy ElevenLabs (drága, szebb)?

### 2. DESIGN (következő lépés)
- [ ] Logó feltöltése fájlként (nem chat-be beillesztve)
- [ ] Színek véglegesítése a logó alapján (zöld #4CAF50 + pink #E91E63)
- [ ] Betűtípus döntés (Poppins? Rubik? Montserrat?)
- [ ] Konkurencia elemzés: Duolingo, Busuu, Babbel, Mondly — mi működik náluk?
- [ ] Wireframe-ek: 10 képernyő kézzel rajzolva is elég elsőre

### 3. TANANYAG ELLENŐRZÉS
- [ ] 20 egység (1A–5C) átnézése: minden szó a helyén van-e?
- [ ] Szófajok ellenőrzése (dance = táncol, NEM tánc)
- [ ] Szókincs deduplikálás (3 forrás → 1 master lista)
- [ ] Oxford szószedet: minden fejezet besorolva egységekhez?

### 4. FELADATOK MENNYISÉGE (eldöntendő)
Feladattípusonként javasolt kérdésszám egységenként:
- Szókincs bemutatás: ÖSSZES szó (6-8 szavanként csoportosítva)
- Visszakérdezés: ÖSSZES szó mindkét irányban (magyar→angol, angol→magyar)
- Begépelés: ÖSSZES szó legalább 1×
- Nyelvtan: MINDEN szabály + MINDEN kivétel (1-1 példa mindegyikre)
- Mondatépítő: 3-5 mondat (1-2 csapdával)
- Kiegészítés: 3-5 mondat
- Két opció: 3-5 kérdés
- Párbeszéd: 1-2 szituáció (az egységhez illő)
- Speaking: 3 fázis (ismétlés, fordítás, reakció)
- Activity: 1-2 szópár (rokon szavak, minimális különbség)

### 5. CONTENT KÉSZÍTÉS (a legnagyobb munka)
- [ ] Claude megírja az Excel táblákat egységenként
- [ ] Gréta átnézi (~15-20 perc/egység, összesen ~7 óra)
- [ ] Javítások beépítése
- [ ] Hanganyag generálás döntés
- [ ] Könyvoldalak szkennelése (PNG)

### 6. FEJLESZTÉS
- [ ] Programozó kiválasztása
- [ ] GitHub repo beállítása (dev branch)
- [ ] MVP: 1. Rész (1A-1C) + szintfelmérő + motiváció
- [ ] Teszt: 10 felhasználóval próba
- [ ] Teljes app: összes egység

---

## NYITOTT KÉRDÉSEK (megválaszolandó)
1. "Szint 1A" alatt mi az a "gyakorlás rész"? → Az ismétlési rendszer: gyenge pontok újra kikérdezése
2. Feladatszámok egységenként: lásd fent a 4. pontot
3. Gender: regisztrációnál kérdezzük, pink/zöld háttér, párbeszédekben "he/she" az alapján
4. Szintfelmérő: részenként 1 perc, legnehezebb kérdések, progresszív
5. Könyv mód: a nyelvtani magyarázatnál 📖 ikon, kinyitható modal, könyvoldal + tanári hang max 2 perc

---

## AMIT NEM KELL MOST CSINÁLNI
- Design csiszolgatás (az majd a programozóval együtt)
- Teljes feladatlista (előbb a tananyag-ellenőrzés kell)
- GitHub push (előbb token visszavonás!)
- A2 bővítés (ez egy következő fázis)
