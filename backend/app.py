from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import random

from config import Config
from models.db import db, migrate


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Database
    db.init_app(app)
    migrate.init_app(app, db)

    # CORS — restricted to allowed origins
    CORS(app, origins=app.config['ALLOWED_ORIGINS'], supports_credentials=True)

    # Security middleware
    from middleware.security import init_security
    init_security(app)

    # Register auth blueprints
    from auth.oauth import oauth_bp
    from auth.webauthn import webauthn_bp
    from auth.progress_api import progress_bp
    from auth.billing import billing_bp
    from auth.tutor import tutor_bp

    app.register_blueprint(oauth_bp)
    app.register_blueprint(webauthn_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(billing_bp)
    app.register_blueprint(tutor_bp)

    # Create tables on first request
    with app.app_context():
        from models.user import User, UserProgress, WordError, UserStreak, WebAuthnCredential
        db.create_all()

    # --- Existing data API (unchanged) ---
    register_data_routes(app)

    return app


# --- Static data (Oxford 3000) ---
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'oxford3000.json')
_data_cache = None


def load_data():
    global _data_cache
    if _data_cache is None:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            _data_cache = json.load(f)
    return _data_cache


def register_data_routes(app):

    @app.route('/api/levels', methods=['GET'])
    def get_levels():
        """Return all 6 levels with chapter counts and word counts."""
        data = load_data()
        levels = []
        for level_def in data['levels']:
            chapters = [c for c in data['chapters'] if c['level'] == level_def['id']]
            word_count = sum(c['wordCount'] for c in chapters)
            levels.append({
                **level_def,
                "wordCount": word_count,
                "chapterCount": len(chapters),
                "chapters": [{"id": c["id"], "name": c["name"], "nameEn": c["nameEn"], "wordCount": c["wordCount"]} for c in chapters]
            })
        return jsonify(levels)

    @app.route('/api/chapters', methods=['GET'])
    def get_chapters():
        """Return all 23 chapters with metadata."""
        data = load_data()
        chapters = []
        for ch in data['chapters']:
            chapters.append({
                "id": ch["id"],
                "name": ch["name"],
                "nameEn": ch["nameEn"],
                "level": ch["level"],
                "wordCount": ch["wordCount"],
                "lessonCount": max(1, (ch["wordCount"] + 9) // 10)
            })
        return jsonify(chapters)

    @app.route('/api/chapters/<int:chapter_id>', methods=['GET'])
    def get_chapter(chapter_id):
        """Return chapter detail with words."""
        data = load_data()
        ch = next((c for c in data['chapters'] if c['id'] == chapter_id), None)
        if not ch:
            return jsonify({"error": "Chapter not found"}), 404
        return jsonify(ch)

    @app.route('/api/chapters/<int:chapter_id>/lesson/<int:lesson_id>', methods=['GET'])
    def get_chapter_lesson(chapter_id, lesson_id):
        """Return a lesson (10 words) from a chapter with distractors."""
        data = load_data()
        ch = next((c for c in data['chapters'] if c['id'] == chapter_id), None)
        if not ch:
            return jsonify({"error": "Chapter not found"}), 404

        words = ch['words']
        per_lesson = 10
        start = (lesson_id - 1) * per_lesson
        end = start + per_lesson
        lesson_words = words[start:end]

        all_chapter_words_en = [w['word'] for w in words]
        all_chapter_words_hu = [w['hungarian'] for w in words]
        for w in lesson_words:
            others_en = [x for x in all_chapter_words_en if x != w['word']]
            others_hu = [x for x in all_chapter_words_hu if x != w['hungarian']]
            w['distractors'] = random.sample(others_en, min(3, len(others_en)))
            w['distractorsHu'] = random.sample(others_hu, min(3, len(others_hu)))

        return jsonify({
            "chapterId": chapter_id,
            "chapterName": ch["name"],
            "lessonId": lesson_id,
            "words": lesson_words,
            "totalLessons": max(1, (len(words) + per_lesson - 1) // per_lesson)
        })

    @app.route('/api/chapters/<int:chapter_id>/dialogues', methods=['GET'])
    def get_chapter_dialogues(chapter_id):
        """Return dialogues for a chapter."""
        data = load_data()
        dialogues = [d for d in data.get('dialogues', []) if d.get('chapterId') == chapter_id]
        return jsonify(dialogues)

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({"status": "ok", "totalWords": load_data()['meta']['totalWords']})


# Create app instance for gunicorn
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
