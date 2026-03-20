from datetime import datetime, timezone
from models.db import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    avatar_url = db.Column(db.String(500))

    # Auth provider (google, facebook, apple)
    auth_provider = db.Column(db.String(50), nullable=False)
    auth_provider_id = db.Column(db.String(255), nullable=False)

    # Subscription
    subscription_status = db.Column(
        db.String(20), nullable=False, default='free'
    )  # free, premium, cancelled
    subscription_expires_at = db.Column(db.DateTime(timezone=True))
    simplepay_customer_id = db.Column(db.String(255))

    # 2FA
    totp_secret = db.Column(db.String(32))
    totp_enabled = db.Column(db.Boolean, default=False)

    # Timestamps
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    last_login_at = db.Column(db.DateTime(timezone=True))

    # Relationships
    progress = db.relationship('UserProgress', backref='user', lazy='dynamic')
    webauthn_credentials = db.relationship(
        'WebAuthnCredential', backref='user', lazy='dynamic'
    )

    __table_args__ = (
        db.UniqueConstraint('auth_provider', 'auth_provider_id', name='uq_provider_id'),
    )

    @property
    def is_premium(self):
        if self.subscription_status != 'premium':
            return False
        if self.subscription_expires_at is None:
            return False
        return self.subscription_expires_at > datetime.now(timezone.utc)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'avatarUrl': self.avatar_url,
            'isPremium': self.is_premium,
            'subscriptionStatus': self.subscription_status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'totpEnabled': self.totp_enabled,
        }


class UserProgress(db.Model):
    __tablename__ = 'user_progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    chapter_id = db.Column(db.Integer, nullable=False)
    lesson_id = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Integer, nullable=False, default=0)
    max_score = db.Column(db.Integer, nullable=False, default=0)
    completed_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        db.UniqueConstraint('user_id', 'chapter_id', 'lesson_id', name='uq_user_lesson'),
    )

    def to_dict(self):
        return {
            'chapterId': self.chapter_id,
            'lessonId': self.lesson_id,
            'score': self.score,
            'maxScore': self.max_score,
            'completedAt': self.completed_at.isoformat() if self.completed_at else None,
        }


class WordError(db.Model):
    """Track which words a user struggles with most."""
    __tablename__ = 'word_errors'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    word_id = db.Column(db.Integer, nullable=False)
    word = db.Column(db.String(100), nullable=False)
    error_count = db.Column(db.Integer, nullable=False, default=1)
    last_error_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        db.UniqueConstraint('user_id', 'word_id', name='uq_user_word_error'),
    )

    def to_dict(self):
        return {
            'wordId': self.word_id,
            'word': self.word,
            'errorCount': self.error_count,
            'lastErrorAt': self.last_error_at.isoformat() if self.last_error_at else None,
        }


class UserStreak(db.Model):
    __tablename__ = 'user_streaks'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    current_streak = db.Column(db.Integer, nullable=False, default=0)
    longest_streak = db.Column(db.Integer, nullable=False, default=0)
    last_active_date = db.Column(db.Date)

    def to_dict(self):
        return {
            'currentStreak': self.current_streak,
            'longestStreak': self.longest_streak,
            'lastActiveDate': self.last_active_date.isoformat() if self.last_active_date else None,
        }


class SM2Review(db.Model):
    """SM-2 spaced repetition data — synced from client."""
    __tablename__ = 'sm2_reviews'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    word_id = db.Column(db.Integer, nullable=False)
    word = db.Column(db.String(100), nullable=False)
    unit_id = db.Column(db.String(10), nullable=False)
    ease_factor = db.Column(db.Float, nullable=False, default=2.5)
    interval = db.Column(db.Integer, nullable=False, default=1)
    repetitions = db.Column(db.Integer, nullable=False, default=0)
    next_review = db.Column(db.Date, nullable=False)
    last_review = db.Column(db.Date, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'word_id', name='uq_user_word_sm2'),
    )

    def to_dict(self):
        return {
            'wordId': self.word_id,
            'word': self.word,
            'unitId': self.unit_id,
            'easeFactor': self.ease_factor,
            'interval': self.interval,
            'repetitions': self.repetitions,
            'nextReview': self.next_review.isoformat() if self.next_review else None,
            'lastReview': self.last_review.isoformat() if self.last_review else None,
        }


class UnitProgressV4(db.Model):
    """V4 unit-based progress tracking."""
    __tablename__ = 'unit_progress_v4'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    unit_id = db.Column(db.String(10), nullable=False)
    completed_lessons = db.Column(db.Integer, nullable=False, default=0)
    total_score = db.Column(db.Integer, nullable=False, default=0)
    total_max_score = db.Column(db.Integer, nullable=False, default=0)
    word_count = db.Column(db.Integer, nullable=False, default=0)
    test_passed = db.Column(db.Boolean, nullable=False, default=False)
    test_score = db.Column(db.Integer)
    completed_at = db.Column(db.DateTime(timezone=True))
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        db.UniqueConstraint('user_id', 'unit_id', name='uq_user_unit_progress'),
    )

    def to_dict(self):
        pct = round((self.total_score / self.total_max_score) * 100) if self.total_max_score > 0 else 0
        return {
            'unitId': self.unit_id,
            'completedLessons': self.completed_lessons,
            'totalScore': self.total_score,
            'totalMaxScore': self.total_max_score,
            'wordCount': self.word_count,
            'testPassed': self.test_passed,
            'testScore': self.test_score,
            'percentCorrect': pct,
            'completedAt': self.completed_at.isoformat() if self.completed_at else None,
        }


class LevelTestResult(db.Model):
    """Stores placement test results."""
    __tablename__ = 'level_test_results'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    start_unit = db.Column(db.String(10), nullable=False)
    parts_passed = db.Column(db.Integer, nullable=False, default=0)
    total_score = db.Column(db.Integer, nullable=False, default=0)
    total_questions = db.Column(db.Integer, nullable=False, default=0)
    taken_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self):
        return {
            'startUnit': self.start_unit,
            'partsPassed': self.parts_passed,
            'totalScore': self.total_score,
            'totalQuestions': self.total_questions,
            'takenAt': self.taken_at.isoformat() if self.taken_at else None,
        }


class WebAuthnCredential(db.Model):
    __tablename__ = 'webauthn_credentials'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    credential_id = db.Column(db.LargeBinary, nullable=False, unique=True)
    public_key = db.Column(db.LargeBinary, nullable=False)
    sign_count = db.Column(db.Integer, nullable=False, default=0)
    device_name = db.Column(db.String(255))
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
