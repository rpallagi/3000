import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql://playeng:playeng@db:5432/playeng'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # OAuth providers
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
    FACEBOOK_APP_ID = os.environ.get('FACEBOOK_APP_ID', '')
    FACEBOOK_APP_SECRET = os.environ.get('FACEBOOK_APP_SECRET', '')
    APPLE_CLIENT_ID = os.environ.get('APPLE_CLIENT_ID', '')
    APPLE_TEAM_ID = os.environ.get('APPLE_TEAM_ID', '')
    APPLE_KEY_ID = os.environ.get('APPLE_KEY_ID', '')

    # SimplePay
    SIMPLEPAY_MERCHANT_ID = os.environ.get('SIMPLEPAY_MERCHANT_ID', '')
    SIMPLEPAY_SECRET_KEY = os.environ.get('SIMPLEPAY_SECRET_KEY', '')
    SIMPLEPAY_SANDBOX = os.environ.get('SIMPLEPAY_SANDBOX', 'true').lower() == 'true'

    # Claude API (AI Tutor)
    CLAUDE_API_KEY = os.environ.get('CLAUDE_API_KEY', '')

    # CORS
    ALLOWED_ORIGINS = os.environ.get(
        'ALLOWED_ORIGINS',
        'https://angolozzunk.hu,https://www.angolozzunk.hu,http://localhost:3001,http://localhost:8080'
    ).split(',')

    # Rate limiting
    RATELIMIT_DEFAULT = '60/minute'
    RATELIMIT_STORAGE_URI = 'memory://'

    # WebAuthn
    RP_ID = os.environ.get('RP_ID', 'angolozzunk.hu')
    RP_NAME = 'PlayENG'
    RP_ORIGIN = os.environ.get('RP_ORIGIN', 'https://angolozzunk.hu')
