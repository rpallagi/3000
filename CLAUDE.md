# PlayENG 3000

## Projekt leírás
Online angol nyelvtanuló platform az Oxford 3000 leggyakrabban használt szó elsajátítására.
Készítette: Greta (PlayENG módszer, 10 év tapasztalat).

## Tech Stack
- **Frontend**: React 18 + React Router v6
- **Backend**: Python Flask
- **Deploy**: Docker Compose on Unraid (192.168.8.235:5008)
- **Repo**: https://github.com/rpallagi/3000

## Struktúra
- 973 szó, 23 tematikus fejezet, 6 szint
- 31 párbeszéd rangsorolt válaszokkal
- Adatok forrása: docs/ könyvtár (OXFORD_A1_*.docx + PlayENG APP.docx)

## Design irányelvek
- Mobil-első (telefon az elsődleges platform)
- Apple-stílusú kártya (card) alapú design
- SVG ikonok, NINCS emoji
- PlayENG branding: kék (#2ea3f2), Open Sans font
- Lovable, letisztult, modern stílus
- Fotók helye biztosítva

## PlayENG módszer (4 feladattípus)
1. Választós kiegészítő (multiple choice) - pontozás: 5/2/1/0
2. Mondatfordítás (sentence building, drag-and-drop) - pontozás: 8/5/3/1
3. Kiejtés (pronunciation, Web Speech API) - pontozás: 8/5/3/1
4. Párbeszéd (dialogue role-play) - pontozás: 8/5/3/0

## Lecke folyamat
Step 0: Megfigyelés (hallgatás+olvasás) -> Választós -> Mondatépítés -> Kiejtés -> Párbeszéd -> Eredmények

## Dev szerverek
- Frontend: `npm start` (port 3001)
- Backend: `python3 -m flask run --port 5001`
- Docker prod: port 5008

## Unraid deploy
```bash
sshpass -p 'Majordomo01' ssh root@192.168.8.235 'cd /tmp/3000 && git pull && docker compose up --build -d'
```

## Fontos fájlok
- `backend/data/oxford3000.json` - teljes szóadatbázis
- `docs/PlayENG APP.docx` - app specifikáció (4 feladattípus részletesen)
- `scripts/parse_docx.py` - docx -> JSON konverter
