"""Server-side progress tracking API — tracks scores, errors, streaks, SM-2, unit progress."""
from datetime import date, datetime, timezone
from flask import Blueprint, request, jsonify, g
from models.db import db
from models.user import UserProgress, WordError, UserStreak, SM2Review, UnitProgressV4, LevelTestResult
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

    chapter_id = data.get('chapterId', 0)
    lesson_id = data.get('lessonId')
    score = data.get('score', 0)
    max_score = data.get('maxScore', 0)
    errors = data.get('errors', [])
    unit_id = data.get('unitId')  # V4: unit-based progress

    # V4: if unitId provided, use hash-based chapter_id for storage
    if unit_id and not chapter_id:
        chapter_id = abs(hash(unit_id)) % 10000

    if not lesson_id:
        return jsonify({'error': 'Missing lessonId'}), 400

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


# --- SM-2 Spaced Repetition API ---

@progress_bp.route('/sm2', methods=['GET'])
@login_required
def get_sm2_items():
    """Get all SM-2 items for the user."""
    items = SM2Review.query.filter_by(user_id=g.user_id).all()
    return jsonify([i.to_dict() for i in items])


@progress_bp.route('/sm2/due', methods=['GET'])
@login_required
def get_sm2_due():
    """Get SM-2 items due for review today."""
    today = date.today()
    items = SM2Review.query.filter(
        SM2Review.user_id == g.user_id,
        SM2Review.next_review <= today,
    ).all()
    return jsonify([i.to_dict() for i in items])


@progress_bp.route('/sm2/sync', methods=['POST'])
@login_required
def sync_sm2():
    """Bulk sync SM-2 items from client localStorage to DB.
    Accepts array of SM2Item objects. Upserts by wordId."""
    data = request.get_json()
    if not data or not isinstance(data, list):
        return jsonify({'error': 'Expected array of SM2 items'}), 400

    for item in data[:500]:  # Max 500 items per sync
        word_id = item.get('wordId')
        if not word_id:
            continue

        existing = SM2Review.query.filter_by(
            user_id=g.user_id,
            word_id=word_id,
        ).first()

        next_review = date.fromisoformat(item['nextReview']) if item.get('nextReview') else date.today()
        last_review = date.fromisoformat(item['lastReview']) if item.get('lastReview') else date.today()

        if existing:
            # Update if client has newer data
            if last_review >= existing.last_review:
                existing.word = item.get('word', existing.word)
                existing.unit_id = item.get('unitId', existing.unit_id)
                existing.ease_factor = item.get('easeFactor', existing.ease_factor)
                existing.interval = item.get('interval', existing.interval)
                existing.repetitions = item.get('repetitions', existing.repetitions)
                existing.next_review = next_review
                existing.last_review = last_review
        else:
            review = SM2Review(
                user_id=g.user_id,
                word_id=word_id,
                word=item.get('word', ''),
                unit_id=item.get('unitId', ''),
                ease_factor=item.get('easeFactor', 2.5),
                interval=item.get('interval', 1),
                repetitions=item.get('repetitions', 0),
                next_review=next_review,
                last_review=last_review,
            )
            db.session.add(review)

    db.session.commit()
    return jsonify({'success': True, 'synced': len(data)})


# --- V4 Unit Progress API ---

@progress_bp.route('/units', methods=['GET'])
@login_required
def get_unit_progress_all():
    """Get progress for all units."""
    items = UnitProgressV4.query.filter_by(user_id=g.user_id).all()
    return jsonify({i.unit_id: i.to_dict() for i in items})


@progress_bp.route('/units/<unit_id>', methods=['POST'])
@login_required
def save_unit_progress(unit_id):
    """Save/update progress for a unit."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    existing = UnitProgressV4.query.filter_by(
        user_id=g.user_id,
        unit_id=unit_id,
    ).first()

    if existing:
        existing.completed_lessons = max(existing.completed_lessons, data.get('completedLessons', 0))
        existing.total_score = max(existing.total_score, data.get('totalScore', 0))
        existing.total_max_score = max(existing.total_max_score, data.get('totalMaxScore', 0))
        existing.word_count = max(existing.word_count, data.get('wordCount', 0))
        if data.get('testPassed'):
            existing.test_passed = True
            existing.test_score = data.get('testScore', existing.test_score)
        if data.get('completed') and not existing.completed_at:
            existing.completed_at = datetime.now(timezone.utc)
    else:
        progress = UnitProgressV4(
            user_id=g.user_id,
            unit_id=unit_id,
            completed_lessons=data.get('completedLessons', 0),
            total_score=data.get('totalScore', 0),
            total_max_score=data.get('totalMaxScore', 0),
            word_count=data.get('wordCount', 0),
            test_passed=data.get('testPassed', False),
            test_score=data.get('testScore'),
        )
        if data.get('completed'):
            progress.completed_at = datetime.now(timezone.utc)
        db.session.add(progress)

    db.session.commit()
    return jsonify({'success': True})


@progress_bp.route('/units/<unit_id>/test', methods=['POST'])
@login_required
def save_unit_test(unit_id):
    """Save unit test result. Must score >= 80% to pass."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    score = data.get('score', 0)
    max_score = data.get('maxScore', 1)
    pct = round((score / max_score) * 100) if max_score > 0 else 0
    passed = pct >= 80

    existing = UnitProgressV4.query.filter_by(
        user_id=g.user_id,
        unit_id=unit_id,
    ).first()

    if existing:
        existing.test_score = pct
        if passed:
            existing.test_passed = True
            existing.completed_at = datetime.now(timezone.utc)
    else:
        progress = UnitProgressV4(
            user_id=g.user_id,
            unit_id=unit_id,
            test_score=pct,
            test_passed=passed,
        )
        if passed:
            progress.completed_at = datetime.now(timezone.utc)
        db.session.add(progress)

    db.session.commit()
    return jsonify({'success': True, 'passed': passed, 'percent': pct})


# --- Level Test API ---

@progress_bp.route('/level-test', methods=['POST'])
@login_required
def save_level_test():
    """Save placement test result."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    result = LevelTestResult(
        user_id=g.user_id,
        start_unit=data.get('startUnit', '1A'),
        parts_passed=data.get('partsPassed', 0),
        total_score=data.get('totalScore', 0),
        total_questions=data.get('totalQuestions', 0),
    )
    db.session.add(result)
    db.session.commit()

    return jsonify({'success': True, 'startUnit': result.start_unit})


@progress_bp.route('/level-test', methods=['GET'])
@login_required
def get_level_test():
    """Get most recent level test result."""
    result = LevelTestResult.query.filter_by(
        user_id=g.user_id,
    ).order_by(LevelTestResult.taken_at.desc()).first()

    if not result:
        return jsonify(None)
    return jsonify(result.to_dict())
