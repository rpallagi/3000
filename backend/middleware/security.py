"""Security middleware: rate limiting, CORS, headers, input validation."""
from flask import request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=['60 per minute'],
    storage_uri='memory://',
)


def init_security(app):
    """Initialize all security middleware."""

    # Rate limiting
    limiter.init_app(app)

    # Stricter limits for auth endpoints
    limiter.limit('10 per minute')(
        app.blueprints.get('oauth', None) or app
    )

    # Security headers via Talisman
    Talisman(
        app,
        force_https=False,  # Cloudflare handles HTTPS
        content_security_policy={
            'default-src': "'self'",
            'script-src': [
                "'self'",
                'https://accounts.google.com',
                'https://connect.facebook.net',
                'https://appleid.cdn-apple.com',
            ],
            'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            'font-src': ["'self'", 'https://fonts.gstatic.com'],
            'img-src': ["'self'", 'data:', 'https:', 'blob:'],
            'connect-src': [
                "'self'",
                'https://accounts.google.com',
                'https://graph.facebook.com',
                'https://appleid.apple.com',
            ],
            'frame-src': [
                'https://accounts.google.com',
                'https://www.facebook.com',
                'https://appleid.apple.com',
            ],
        },
        content_security_policy_nonce_in=['script-src'],
        session_cookie_secure=True,
        session_cookie_http_only=True,
        session_cookie_samesite='Lax',
    )

    # Input validation for path parameters
    @app.before_request
    def validate_input():
        # Validate integer path params
        if request.view_args:
            for key, value in request.view_args.items():
                if isinstance(value, int):
                    if value < 0 or value > 100000:
                        return jsonify({'error': 'Invalid parameter'}), 400

    # Log requests (basic)
    @app.after_request
    def log_request(response):
        if response.status_code >= 400:
            app.logger.warning(
                '%s %s %s %s',
                request.remote_addr,
                request.method,
                request.path,
                response.status_code,
            )
        return response
