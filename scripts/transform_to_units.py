#!/usr/bin/env python3
"""
Transform oxford3000.json from 23 chapters → 20 units (1A–5C)
Based on Greta v4 specification (cowork-2026-03-19)

Mapping logic:
- Words are redistributed from thematic chapters to grammar-centric units
- Each unit gets grammar rules, vocabulary, and 10 task type definitions
- Dialogues are mapped to situations (7 types)
"""

import json
import os
import sys

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'oxford3000.json')
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'oxford3000_v4.json')

# 20 units definition (Greta v4)
UNITS = [
    {
        "id": "1A", "part": 1, "order": 1,
        "title": "Névelők (a/an)",
        "titleEn": "Articles (a/an)",
        "grammarFocus": "to_be_articles",
        "color": "green",
        "sourceChapters": [1, 2],  # Basic Communication + Pronouns & Articles
        "grammar": {
            "ruleBasic": "a → mássalhangzó betűvel kezdődő szó előtt (a dog, a cat)\nan → magánhangzó betűvel (a, e, i, o, u) kezdődő szó előtt (an apple, an egg)",
            "ruleExtra": "Kivételek: a university (ju-t ejtünk), an hour (h néma). Az esetek 99%-ában a szó első betűje alapján döntesz!",
            "examples": [
                {"en": "This is a dog.", "hu": "Ez egy kutya."},
                {"en": "This is an apple.", "hu": "Ez egy alma."},
                {"en": "I have a cat and an umbrella.", "hu": "Van egy macskám és egy esernyőm."},
            ],
        },
    },
    {
        "id": "1B", "part": 1, "order": 2,
        "title": "Melléknevek és színek",
        "titleEn": "Adjectives & Colours",
        "grammarFocus": "adjectives_basic",
        "color": "green",
        "sourceChapters": [4, 21],  # Colours + Adjectives
        "grammar": {
            "ruleBasic": "A melléknév a főnév ELŐTT áll (nem úgy mint a magyarban!)\nbig dog = nagy kutya, red car = piros autó",
            "ruleExtra": "A melléknév NEM kap többes számot: two big dogs (NEM: two bigs dogs)",
            "examples": [
                {"en": "It is a big red car.", "hu": "Ez egy nagy piros autó."},
                {"en": "She is a tall woman.", "hu": "Ő egy magas nő."},
            ],
        },
    },
    {
        "id": "1C", "part": 1, "order": 3,
        "title": "Alapérzelmek",
        "titleEn": "Basic Emotions",
        "grammarFocus": "to_be_adjectives",
        "color": "pink",
        "sourceChapters": [15],  # Emotions & Character
        "grammar": {
            "ruleBasic": "I am happy. = Boldog vagyok.\nShe is sad. = Szomorú.\nAre you tired? = Fáradt vagy?",
            "ruleExtra": "to be + melléknév: I am/you are/he is/she is/it is/we are/they are",
            "examples": [
                {"en": "I am happy today.", "hu": "Ma boldog vagyok."},
                {"en": "She is tired.", "hu": "Ő fáradt."},
                {"en": "Are you angry?", "hu": "Dühös vagy?"},
            ],
        },
    },
    {
        "id": "1D", "part": 1, "order": 4,
        "title": "Present Simple (állító)",
        "titleEn": "Present Simple (affirmative)",
        "grammarFocus": "present_simple_aff",
        "color": "green",
        "sourceChapters": [20],  # Verbs — Basic Actions (first half)
        "grammar": {
            "ruleBasic": "I/you/we/they + ige alap: I play football.\nHe/she/it + ige+s: She plays football.",
            "ruleExtra": "Kivételek: go→goes, do→does, have→has, watch→watches, study→studies",
            "examples": [
                {"en": "I play football every day.", "hu": "Minden nap focizok."},
                {"en": "She likes chocolate.", "hu": "Ő szereti a csokit."},
                {"en": "We live in Budapest.", "hu": "Budapesten lakunk."},
            ],
        },
    },
    {
        "id": "2A", "part": 2, "order": 5,
        "title": "Present Simple (tagadás, kérdés)",
        "titleEn": "Present Simple (negative, questions)",
        "grammarFocus": "present_simple_neg_q",
        "color": "green",
        "sourceChapters": [20],  # Verbs — Basic Actions (second half)
        "grammar": {
            "ruleBasic": "Tagadás: I don't like coffee. / She doesn't like coffee.\nKérdés: Do you like coffee? / Does she like coffee?",
            "ruleExtra": "don't/doesn't után MINDIG alapalak: She doesn't plays → She doesn't play",
            "examples": [
                {"en": "I don't like coffee.", "hu": "Nem szeretem a kávét."},
                {"en": "Does she speak English?", "hu": "Beszél ő angolul?"},
                {"en": "We don't live here.", "hu": "Nem itt lakunk."},
            ],
        },
    },
    {
        "id": "2B", "part": 2, "order": 6,
        "title": "Birtokos melléknevek + have got",
        "titleEn": "Possessive adjectives + have got",
        "grammarFocus": "possessives_have_got",
        "color": "green",
        "sourceChapters": [5],  # People & Family
        "grammar": {
            "ruleBasic": "my (enyém), your (tied), his (övé-fiú), her (övé-lány), its (övé-tárgy), our (miénk), their (övék)\nI have got a sister. = Van egy lánytestvérem.",
            "ruleExtra": "have got = brit angol, have = amerikai angol. Mindkettő helyes!",
            "examples": [
                {"en": "This is my mother.", "hu": "Ő az anyám."},
                {"en": "Have you got a brother?", "hu": "Van testvéred?"},
                {"en": "Their house is big.", "hu": "Az ő házuk nagy."},
            ],
        },
    },
    {
        "id": "2C", "part": 2, "order": 7,
        "title": "Számok, dátumok, idő",
        "titleEn": "Numbers, dates, time",
        "grammarFocus": "numbers_time",
        "color": "pink",
        "sourceChapters": [3, 10],  # Numbers & Measurements + Time
        "grammar": {
            "ruleBasic": "What time is it? = Hány óra?\nIt's half past two. = Fél három.\nIt's quarter to five. = Háromnegyed öt.",
            "ruleExtra": "Dátum: March 20th (twentieth) — a sorszámot mondjuk, de a számot írjuk. Hónapot MINDIG nagybetűvel!",
            "examples": [
                {"en": "It's ten o'clock.", "hu": "Tíz óra van."},
                {"en": "My birthday is on March 5th.", "hu": "Március 5-én van a születésnapom."},
            ],
        },
    },
    {
        "id": "2D", "part": 2, "order": 8,
        "title": "There is / There are",
        "titleEn": "There is / There are",
        "grammarFocus": "there_is_are",
        "color": "green",
        "sourceChapters": [9, 12],  # Home & Living + Places & Buildings
        "grammar": {
            "ruleBasic": "There is + egyes szám: There is a book on the table.\nThere are + többes szám: There are two cats in the garden.",
            "ruleExtra": "Tagadás: There isn't / There aren't\nKérdés: Is there...? / Are there...?",
            "examples": [
                {"en": "There is a park near my house.", "hu": "Van egy park a házam közelében."},
                {"en": "Are there any shops?", "hu": "Vannak boltok?"},
            ],
        },
    },
    {
        "id": "2E", "part": 2, "order": 9,
        "title": "Gyakorisági határozószók",
        "titleEn": "Frequency adverbs",
        "grammarFocus": "frequency_adverbs",
        "color": "green",
        "sourceChapters": [22],  # Adverbs, Prepositions & Conjunctions
        "grammar": {
            "ruleBasic": "always (100%) > usually (80%) > often (60%) > sometimes (40%) > rarely (20%) > never (0%)\nHelye: az ige ELŐTT, de a to be UTÁN!",
            "ruleExtra": "I always eat breakfast. (ige előtt)\nShe is always happy. (to be után)",
            "examples": [
                {"en": "I always drink coffee in the morning.", "hu": "Mindig kávét iszom reggel."},
                {"en": "She never eats meat.", "hu": "Ő soha nem eszik húst."},
                {"en": "We sometimes go to the cinema.", "hu": "Néha moziba megyünk."},
            ],
        },
    },
    {
        "id": "3A", "part": 3, "order": 10,
        "title": "Past Simple (szabályos igék, was/were)",
        "titleEn": "Past Simple (regular verbs, was/were)",
        "grammarFocus": "past_simple_regular",
        "color": "green",
        "sourceChapters": [11],  # School & Learning
        "grammar": {
            "ruleBasic": "Szabályos ige: ige + -ed → play → played, walk → walked\nwas/were: I was, you were, he/she/it was, we/they were",
            "ruleExtra": "Helyesírás: like → liked (e-re végződő), stop → stopped (rövid magánhangzó + mássalhangzó), study → studied (y → ied)",
            "examples": [
                {"en": "I played football yesterday.", "hu": "Tegnap focit játszottam."},
                {"en": "She was happy.", "hu": "Ő boldog volt."},
                {"en": "We were at school.", "hu": "Az iskolában voltunk."},
            ],
        },
    },
    {
        "id": "3B", "part": 3, "order": 11,
        "title": "Past Simple (tagadás, kérdés, rendhagyó)",
        "titleEn": "Past Simple (negative, questions, irregular)",
        "grammarFocus": "past_simple_neg_irreg",
        "color": "green",
        "sourceChapters": [13],  # Transport & Travel
        "grammar": {
            "ruleBasic": "Tagadás: I didn't go. (NEM: I didn't went!)\nKérdés: Did you go? (NEM: Did you went?)\nRendhagyó: go→went, see→saw, eat→ate, come→came",
            "ruleExtra": "didn't után MINDIG alapalak! A rendhagyó igéket meg kell tanulni.",
            "examples": [
                {"en": "I didn't go to school yesterday.", "hu": "Tegnap nem mentem iskolába."},
                {"en": "Did you see the film?", "hu": "Láttad a filmet?"},
                {"en": "She came home late.", "hu": "Későn jött haza."},
            ],
        },
    },
    {
        "id": "3C", "part": 3, "order": 12,
        "title": "Külső megjelenés",
        "titleEn": "Appearances",
        "grammarFocus": "appearance_descriptions",
        "color": "pink",
        "sourceChapters": [8],  # Clothing & Appearance
        "grammar": {
            "ruleBasic": "She has got long brown hair. = Hosszú barna haja van.\nHe is tall and slim. = Ő magas és vékony.\nShe is wearing a red dress. = Piros ruhát visel.",
            "ruleExtra": "has got = állandó tulajdonság, is wearing = amit éppen visel",
            "examples": [
                {"en": "He has got blue eyes.", "hu": "Kék szeme van."},
                {"en": "She is wearing a hat.", "hu": "Kalapot visel."},
            ],
        },
    },
    {
        "id": "3D", "part": 3, "order": 13,
        "title": "Személyiség és jellem",
        "titleEn": "Personality & Character",
        "grammarFocus": "personality_adjectives",
        "color": "pink",
        "sourceChapters": [16],  # Leisure & Entertainment
        "grammar": {
            "ruleBasic": "He is kind. = Ő kedves.\nShe is funny and clever. = Ő vicces és okos.\nMelléknevek személyiségre: kind, funny, clever, shy, lazy, brave",
            "ruleExtra": "Fokozás: kind → kinder → the kindest / clever → more clever → the most clever",
            "examples": [
                {"en": "My friend is very kind.", "hu": "A barátom nagyon kedves."},
                {"en": "She is braver than me.", "hu": "Ő bátrabb nálam."},
            ],
        },
    },
    {
        "id": "4A", "part": 4, "order": 14,
        "title": "Present Continuous",
        "titleEn": "Present Continuous",
        "grammarFocus": "present_continuous",
        "color": "green",
        "sourceChapters": [17],  # Jobs
        "grammar": {
            "ruleBasic": "am/is/are + ige-ing = MOST csinálom\nI am reading. She is cooking. They are playing.",
            "ruleExtra": "NEM használjuk: like, love, want, know, understand igékkel! (I am liking → ROSSZ)",
            "examples": [
                {"en": "I am reading a book now.", "hu": "Most egy könyvet olvasok."},
                {"en": "She is cooking dinner.", "hu": "Ő vacsorát főz."},
                {"en": "What are you doing?", "hu": "Mit csinálsz?"},
            ],
        },
    },
    {
        "id": "4B", "part": 4, "order": 15,
        "title": "Past Continuous",
        "titleEn": "Past Continuous",
        "grammarFocus": "past_continuous",
        "color": "green",
        "sourceChapters": [18],  # Work & Business
        "grammar": {
            "ruleBasic": "was/were + ige-ing = éppen csináltam (a múltban)\nI was reading when she called.",
            "ruleExtra": "Past Continuous + Past Simple: két cselekvés — az egyik folyamatban volt, a másik megszakította",
            "examples": [
                {"en": "I was sleeping when the phone rang.", "hu": "Aludtam, amikor csörgött a telefon."},
                {"en": "They were playing football at 5 pm.", "hu": "5-kor fociztak."},
            ],
        },
    },
    {
        "id": "4C", "part": 4, "order": 16,
        "title": "Összehasonlítás és fokozás",
        "titleEn": "Comparatives & Superlatives",
        "grammarFocus": "comparatives",
        "color": "green",
        "sourceChapters": [14],  # Nature & Weather
        "grammar": {
            "ruleBasic": "Rövid szó: big → bigger → the biggest\nHosszú szó: beautiful → more beautiful → the most beautiful",
            "ruleExtra": "Rendhagyó: good → better → the best, bad → worse → the worst",
            "examples": [
                {"en": "Summer is hotter than spring.", "hu": "A nyár melegebb, mint a tavasz."},
                {"en": "This is the most beautiful city.", "hu": "Ez a legszebb város."},
            ],
        },
    },
    {
        "id": "4D", "part": 4, "order": 17,
        "title": "Étel és ital — megszámlálható/megszámlálhatatlan",
        "titleEn": "Food & Drinks — countable/uncountable",
        "grammarFocus": "countable_uncountable",
        "color": "pink",
        "sourceChapters": [7, 6],  # Food & Drink + Body & Health
        "grammar": {
            "ruleBasic": "Megszámlálható: an apple, two apples — How many?\nMegszámlálhatatlan: water, bread, milk — How much?\nsome/any: There is some milk. Is there any milk?",
            "ruleExtra": "Nem mondhatjuk: two milks → two glasses of milk, two breads → two pieces/slices of bread",
            "examples": [
                {"en": "How much milk do you want?", "hu": "Mennyi tejet kérsz?"},
                {"en": "There are some apples on the table.", "hu": "Van néhány alma az asztalon."},
            ],
        },
    },
    {
        "id": "5A", "part": 5, "order": 18,
        "title": "Present Perfect",
        "titleEn": "Present Perfect",
        "grammarFocus": "present_perfect",
        "color": "green",
        "sourceChapters": [19],  # Technology & Media
        "grammar": {
            "ruleBasic": "have/has + 3. alak = csináltam (és ez most is fontos)\nI have been to London. She has finished her homework.",
            "ruleExtra": "ever/never/already/yet/just: Have you ever been to London? I have just arrived.",
            "examples": [
                {"en": "I have never been to Paris.", "hu": "Soha nem jártam Párizsban."},
                {"en": "She has already finished.", "hu": "Ő már befejezte."},
                {"en": "Have you ever eaten sushi?", "hu": "Ettél már sushit?"},
            ],
        },
    },
    {
        "id": "5B", "part": 5, "order": 19,
        "title": "Jövő idő (will, going to)",
        "titleEn": "Future (will, going to)",
        "grammarFocus": "future",
        "color": "green",
        "sourceChapters": [23],  # Common Collocations
        "grammar": {
            "ruleBasic": "will = spontán döntés, jóslat: I will help you. It will rain tomorrow.\ngoing to = terv, szándék: I am going to study medicine.",
            "ruleExtra": "will not = won't. Ígéret: I won't forget. Ajánlat: I'll open the door.",
            "examples": [
                {"en": "I will call you later.", "hu": "Később felhívlak."},
                {"en": "She is going to travel to Italy.", "hu": "Olaszországba fog utazni."},
                {"en": "It won't rain tomorrow.", "hu": "Holnap nem fog esni."},
            ],
        },
    },
    {
        "id": "5C", "part": 5, "order": 20,
        "title": "Feltételes mód (if)",
        "titleEn": "Conditional (if...then...)",
        "grammarFocus": "conditional",
        "color": "green",
        "sourceChapters": [],  # Uses mixed words from multiple chapters
        "grammar": {
            "ruleBasic": "If + Present Simple → will + alapalak\nIf it rains, I will stay home. = Ha esik, otthon maradok.",
            "ruleExtra": "SOHA: If it will rain → ROSSZ! Az if után NEM jön will!",
            "examples": [
                {"en": "If you study, you will pass.", "hu": "Ha tanulsz, átmész."},
                {"en": "If it rains, we won't go out.", "hu": "Ha esik, nem megyünk ki."},
                {"en": "What will you do if you win?", "hu": "Mit fogsz csinálni, ha nyersz?"},
            ],
        },
    },
]

# 10 task types (Greta v4)
TASK_TYPES = [
    {"id": 1, "name": "Szókincs bemutatás", "nameEn": "Vocabulary Introduction", "type": "vocab", "color": "pink"},
    {"id": 2, "name": "Visszakérdezés", "nameEn": "Vocabulary Quiz", "type": "vocab", "color": "pink"},
    {"id": 3, "name": "Begépelés", "nameEn": "Typing (Wordle)", "type": "vocab", "color": "pink"},
    {"id": 4, "name": "Nyelvtan", "nameEn": "Grammar Explanation", "type": "grammar", "color": "green"},
    {"id": 5, "name": "Mondatépítő", "nameEn": "Sentence Builder", "type": "grammar", "color": "green"},
    {"id": 6, "name": "Kiegészítés", "nameEn": "Fill in the Gap", "type": "grammar", "color": "green"},
    {"id": 7, "name": "Melyik a helyes?", "nameEn": "Two Options", "type": "grammar", "color": "green"},
    {"id": 8, "name": "Párbeszéd", "nameEn": "Dialogue", "type": "communication", "color": "blue"},
    {"id": 9, "name": "Beszédgyakorlat", "nameEn": "Speaking", "type": "communication", "color": "blue"},
    {"id": 10, "name": "Activity", "nameEn": "Activity", "type": "activity", "color": "orange"},
]

# 7 situations for dialogues
SITUATIONS = [
    {"id": 1, "name": "Étteremben", "nameEn": "At a Restaurant", "icon": "restaurant"},
    {"id": 2, "name": "Boltban", "nameEn": "At a Shop", "icon": "shop"},
    {"id": 3, "name": "Reptéren", "nameEn": "At the Airport", "icon": "airport"},
    {"id": 4, "name": "Taxiban", "nameEn": "In a Taxi", "icon": "taxi"},
    {"id": 5, "name": "Hotelben", "nameEn": "At a Hotel", "icon": "hotel"},
    {"id": 6, "name": "Ismerkedés", "nameEn": "Meeting People", "icon": "people"},
    {"id": 7, "name": "Telefonon/interneten", "nameEn": "Phone/Internet", "icon": "phone"},
]


def load_data():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def transform():
    old_data = load_data()
    old_chapters = {ch['id']: ch for ch in old_data['chapters']}

    new_units = []
    word_id_counter = 1
    used_word_ids = set()

    for unit_def in UNITS:
        unit = {
            "id": unit_def["id"],
            "part": unit_def["part"],
            "order": unit_def["order"],
            "title": unit_def["title"],
            "titleEn": unit_def["titleEn"],
            "grammarFocus": unit_def["grammarFocus"],
            "color": unit_def["color"],
            "grammar": unit_def["grammar"],
            "taskTypes": TASK_TYPES,
            "words": [],
            "wordCount": 0,
        }

        # Collect words from source chapters
        for ch_id in unit_def["sourceChapters"]:
            ch = old_chapters.get(ch_id)
            if not ch:
                continue
            words_from_ch = ch['words']

            # Special case: chapter 20 (Verbs) split between 1D and 2A
            if ch_id == 20 and unit_def["id"] == "1D":
                words_from_ch = words_from_ch[:47]  # First half for 1D
            elif ch_id == 20 and unit_def["id"] == "2A":
                words_from_ch = words_from_ch[47:]  # Second half for 2A

            for word in words_from_ch:
                if word['id'] not in used_word_ids:
                    new_word = {
                        "id": word['id'],
                        "word": word['word'],
                        "wordDisplay": word.get('wordDisplay', word['word']),
                        "hungarian": word['hungarian'],
                        "pos": word['pos'],
                        "unitId": unit_def["id"],
                        "sentences": word.get('sentences', []),
                    }
                    unit["words"].append(new_word)
                    used_word_ids.add(word['id'])

        unit["wordCount"] = len(unit["words"])
        new_units.append(unit)

    # Handle remaining unassigned words — distribute to units with fewer words
    remaining_words = []
    for ch in old_data['chapters']:
        for word in ch['words']:
            if word['id'] not in used_word_ids:
                remaining_words.append(word)
                used_word_ids.add(word['id'])

    if remaining_words:
        # Distribute evenly among units with < 30 words, prioritizing 5C
        small_units = sorted(
            [u for u in new_units if u['wordCount'] < 30],
            key=lambda u: u['wordCount']
        )
        if not small_units:
            small_units = [next(u for u in new_units if u['id'] == '5C')]

        for i, word in enumerate(remaining_words):
            target_unit = small_units[i % len(small_units)]
            new_word = {
                "id": word['id'],
                "word": word['word'],
                "wordDisplay": word.get('wordDisplay', word['word']),
                "hungarian": word['hungarian'],
                "pos": word['pos'],
                "unitId": target_unit['id'],
                "sentences": word.get('sentences', []),
            }
            target_unit["words"].append(new_word)

        # Update word counts
        for u in new_units:
            u["wordCount"] = len(u["words"])

    # Map dialogues to situations
    new_dialogues = []
    for d in old_data.get('dialogues', []):
        new_dialogues.append(d)

    # Build output
    total_words = sum(u['wordCount'] for u in new_units)
    output = {
        "units": new_units,
        "taskTypes": TASK_TYPES,
        "situations": SITUATIONS,
        "dialogues": new_dialogues,
        # Keep old structure for backward compatibility
        "levels": old_data['levels'],
        "chapters": old_data['chapters'],
        "meta": {
            "version": "4.2",
            "totalWords": total_words,
            "totalUnits": len(new_units),
            "totalChapters": len(old_data['chapters']),
            "totalLevels": len(old_data['levels']),
            "source": "Oxford 3000 A1 — PlayENG v4 (Greta cowork 2026-03-19)",
        },
    }

    return output


def main():
    output = transform()

    # Print summary
    print("=== PlayENG v4 Transform Summary ===")
    print(f"Total units: {output['meta']['totalUnits']}")
    print(f"Total words: {output['meta']['totalWords']}")
    print(f"Task types: {len(output['taskTypes'])}")
    print(f"Situations: {len(output['situations'])}")
    print()

    for unit in output['units']:
        print(f"  {unit['id']:3s} [{unit['color']:5s}] {unit['title']} — {unit['wordCount']} szó")

    # Write output
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nWritten to: {OUTPUT_PATH}")

    # Also update the main file
    main_path = DATA_PATH
    with open(main_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Updated main file: {main_path}")


if __name__ == '__main__':
    main()
