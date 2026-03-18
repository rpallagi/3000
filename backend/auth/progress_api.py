"""Server-side progress tracking API — tracks scores, errors, and streaks."""
from datetime import date, datetime, timezone
from flask import Blueprint, request, jsonify, g
from models.db import db
from models.user import UserProgress, WordError, UserStreak
from auth.jwt_utils import login_required

progress_bp = Blueprint('progress', __name__, url_prefix='/api/progress')


@progress_bp.route('', methods=['GET'])
@login_required
def get_progress():
    """Get all progress for the current user."""
    lessons = UserProgress.query.filter_by(user_id=g.user_id).all()
    errors = WordError.query.filter_by(user_id=g.user_id).order_by(
        WordError.error_count.desc()
    ).all()
    streak = UserStreak.query.filter_by(user_id=g.user_id).first()

    return jsonify({
        'lessons': {
            f'{l.chapter_id}-{l.lesson_id}': l.to_dict() for l in lessons
        },
        'errors': [e.to_dict() for e in errors],
        'streak': streak.to_dict() if streak else {'currentStreak': 0, 'longestStreak': 0, 'lastActiveDate': None},
        'weakWords': [e.to_dict() for e in errors[:20]],  # Top 20 weakest words
    })


@progress_bp.route('/lesson', methods=['POST'])
@login_required
def save_lesson():
    """Save a lesson result with error tracking."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    chapter_id = data.get('chapterId')
    lesson_id = data.get('lessonId')
    score = data.get('score', 0)
    max_score = data.get('maxScore', 0)
    errors = data.get('errors', [])

    if not chapter_id or not lesson_id:
        return jsonify({'error': 'Missing chapterId or lessonId'}), 400

    # Upsert lesson progress (keep best score)
    existing = UserProgress.query.filter_by(
        user_id=g.user_id,
        chapter_id=chapter_id,
        lesson_id=lesson_id,
    ).first()

    if existing:
        if score > existing.score:
            existing.score = score
            existing.max_score = max_score
            existing.completed_at = datetime.now(timezone.utc)
    else:
        progress = UserProgress(
            user_id=g.user_id,
            chapter_id=chapter_id,
            lesson_id=lesson_id,
            score=score,
            max_score=max_score,
        )
        db.session.add(progress)

    # Track word errors
    for err in errors:
        word_id = err.get('wordId')
        word = err.get('word', '')
        if not word_id:
            continue

        word_error = WordError.query.filter_by(
            user_id=g.user_id,
            word_id=word_id,
        ).first()

        if word_error:
            word_error.error_count += 1
            word_error.last_error_at = datetime.now(timezone.utc)
        else:
            word_error = WordError(
                user_id=g.user_id,
                word_id=word_id,
                word=word,
            )
            db.session.add(word_error)

    # Update streak
    today = date.today()
    streak = UserStreak.query.filter_by(user_id=g.user_id).first()

    if not streak:
        streak = UserStreak(
            user_id=g.user_id,
            current_streak=1,
            longest_streak=1,
            last_active_date=today,
        )
        db.session.add(streak)
    else:
        if streak.last_active_date == today:
            pass  # Already active today
        elif streak.last_active_date and (today - streak.last_active_date).days == 1:
            streak.current_streak += 1
            if streak.current_streak > streak.longest_streak:
                streak.longest_streak = streak.current_streak
            streak.last_active_date = today
        else:
            streak.current_streak = 1
            streak.last_active_date = today

    db.session.commit()

    return jsonify({'success': True})


@progress_bp.route('/weak-words', methods=['GET'])
@login_required
def get_weak_words():
    """Get words the user struggles with most — for focused practice."""
    errors = WordError.query.filter_by(user_id=g.user_id).order_by(
        WordError.error_count.desc()
    ).limit(30).all()

    return jsonify([e.to_dict() for e in errors])


@progress_bp.route('/chapter/<int:chapter_id>', methods=['GET'])
@login_required
def get_chapter_progress(chapter_id):
    """Get progress for a specific chapter."""
    lessons = UserProgress.query.filter_by(
        user_id=g.user_id,
        chapter_id=chapter_id,
    ).all()

    return jsonify([l.to_dict() for l in lessons])
