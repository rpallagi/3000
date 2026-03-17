from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Load Oxford 3000 data
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'oxford3000.json')

def load_words():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route('/api/levels', methods=['GET'])
def get_levels():
    """Return all 6 levels with metadata."""
    levels = [
        {"id": 1, "name": "Alapok", "nameEn": "Basics", "description": "Bemutatkozás, számok, színek, alapvető igék", "wordCount": 500, "icon": "🌱"},
        {"id": 2, "name": "Mindennapok", "nameEn": "Daily Life", "description": "Család, étel, otthon, idő, időjárás", "wordCount": 500, "icon": "🏠"},
        {"id": 3, "name": "Társalgás", "nameEn": "Conversation", "description": "Vélemény, érzelmek, kérdések, válaszok", "wordCount": 500, "icon": "💬"},
        {"id": 4, "name": "Felfedezés", "nameEn": "Exploration", "description": "Utazás, vásárlás, munka, szabadidő", "wordCount": 500, "icon": "🧭"},
        {"id": 5, "name": "Kapcsolatok", "nameEn": "Connections", "description": "Történetmesélés, viták, összetett mondatok", "wordCount": 500, "icon": "🤝"},
        {"id": 6, "name": "Magabiztosság", "nameEn": "Confidence", "description": "Folyékony beszéd, árnyalt kifejezések", "wordCount": 500, "icon": "🎯"},
    ]
    return jsonify(levels)

@app.route('/api/levels/<int:level_id>/words', methods=['GET'])
def get_words(level_id):
    """Return words for a specific level."""
    words = load_words()
    level_words = [w for w in words if w.get('level') == level_id]
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    start = (page - 1) * per_page
    end = start + per_page
    return jsonify({
        "words": level_words[start:end],
        "total": len(level_words),
        "page": page,
        "per_page": per_page
    })

@app.route('/api/levels/<int:level_id>/lesson/<int:lesson_id>', methods=['GET'])
def get_lesson(level_id, lesson_id):
    """Return a lesson with words and example sentences."""
    words = load_words()
    level_words = [w for w in words if w.get('level') == level_id]
    per_lesson = 10
    start = (lesson_id - 1) * per_lesson
    end = start + per_lesson
    lesson_words = level_words[start:end]
    return jsonify({
        "levelId": level_id,
        "lessonId": lesson_id,
        "words": lesson_words,
        "totalLessons": (len(level_words) + per_lesson - 1) // per_lesson
    })

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
