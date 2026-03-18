"""OAuth 2.0 social login handlers for Google, Facebook, and Apple."""
import requests
from flask import Blueprint, request, jsonify, current_app, redirect
from datetime import datetime, timezone
from models.db import db
from models.user import User
from auth.jwt_utils import create_access_token, create_refresh_token

oauth_bp = Blueprint('oauth', __name__, url_prefix='/api/auth')


@oauth_bp.route('/google', methods=['POST'])
def google_login():
    """Exchange Google OAuth token for app JWT."""
    data = request.get_json()
    if not data or 'token' not in data:
        return jsonify({'error': 'Missing token'}), 400

    # Verify Google token
    try:
        google_resp = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {data["token"]}'},
            timeout=10
        )
        if google_resp.status_code != 200:
            return jsonify({'error': 'Invalid Google token'}), 401

        google_user = google_resp.json()
    except requests.RequestException:
        return jsonify({'error': 'Failed to verify Google token'}), 502

    email = google_user.get('email')
    if not email:
        return jsonify({'error': 'Email not provided by Google'}), 400

    return _login_or_register(
        provider='google',
        provider_id=google_user['sub'],
        email=email,
        name=google_user.get('name', email.split('@')[0]),
        avatar_url=google_user.get('picture'),
    )


@oauth_bp.route('/facebook', methods=['POST'])
def facebook_login():
    """Exchange Facebook OAuth token for app JWT."""
    data = request.get_json()
    if not data or 'token' not in data:
        return jsonify({'error': 'Missing token'}), 400

    try:
        fb_resp = requests.get(
            'https://graph.facebook.com/me',
            params={
                'fields': 'id,name,email,picture.type(large)',
                'access_token': data['token'],
            },
            timeout=10
        )
        if fb_resp.status_code != 200:
            return jsonify({'error': 'Invalid Facebook token'}), 401

        fb_user = fb_resp.json()
    except requests.RequestException:
        return jsonify({'error': 'Failed to verify Facebook token'}), 502

    email = fb_user.get('email')
    if not email:
        return jsonify({'error': 'Email not provided by Facebook'}), 400

    avatar = None
    if 'picture' in fb_user and 'data' in fb_user['picture']:
        avatar = fb_user['picture']['data'].get('url')

    return _login_or_register(
        provider='facebook',
        provider_id=fb_user['id'],
        email=email,
        name=fb_user.get('name', email.split('@')[0]),
        avatar_url=avatar,
    )


@oauth_bp.route('/apple', methods=['POST'])
def apple_login():
    """Exchange Apple Sign-In token for app JWT."""
    data = request.get_json()
    if not data or 'id_token' not in data:
        return jsonify({'error': 'Missing id_token'}), 400

    # Apple sends identity token (JWT) — decode and verify
    import jwt as pyjwt
    try:
        # Fetch Apple's public keys
        apple_keys_resp = requests.get(
            'https://appleid.apple.com/auth/keys',
            timeout=10
        )
        apple_keys = apple_keys_resp.json()

        # Decode without verification first to get kid
        unverified = pyjwt.decode(
            data['id_token'], options={'verify_signature': False}
        )
        kid = pyjwt.get_unverified_header(data['id_token'])['kid']

        # Find matching key
        key_data = next(k for k in apple_keys['keys'] if k['kid'] == kid)
        public_key = pyjwt.algorithms.RSAAlgorithm.from_jwk(key_data)

        payload = pyjwt.decode(
            data['id_token'],
            public_key,
            algorithms=['RS256'],
            audience=current_app.config['APPLE_CLIENT_ID'],
            issuer='https://appleid.apple.com',
        )
    except Exception:
        return jsonify({'error': 'Invalid Apple token'}), 401

    email = payload.get('email')
    if not email:
        return jsonify({'error': 'Email not provided by Apple'}), 400

    # Apple may send name only on first login
    name = email.split('@')[0]
    if 'user' in data and isinstance(data['user'], dict):
        first = data['user'].get('firstName', '')
        last = data['user'].get('lastName', '')
        if first or last:
            name = f'{first} {last}'.strip()

    return _login_or_register(
        provider='apple',
        provider_id=payload['sub'],
        email=email,
        name=name,
        avatar_url=None,
    )


def _login_or_register(provider, provider_id, email, name, avatar_url):
    """Find existing user or create new one, return JWT tokens."""
    user = User.query.filter_by(
        auth_provider=provider,
        auth_provider_id=provider_id
    ).first()

    if not user:
        # Check if email already exists with different provider
        existing = User.query.filter_by(email=email).first()
        if existing:
            # Link to existing account
            user = existing
            user.auth_provider = provider
            user.auth_provider_id = provider_id
        else:
            user = User(
                email=email,
                name=name,
                avatar_url=avatar_url,
                auth_provider=provider,
                auth_provider_id=provider_id,
            )
            db.session.add(user)

    user.last_login_at = datetime.now(timezone.utc)
    if avatar_url and not user.avatar_url:
        user.avatar_url = avatar_url
    if name and user.name == user.email.split('@')[0]:
        user.name = name

    db.session.commit()

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    return jsonify({
        'user': user.to_dict(),
        'accessToken': access_token,
        'refreshToken': refresh_token,
    })


@oauth_bp.route('/refresh', methods=['POST'])
def refresh():
    """Exchange refresh token for new access token."""
    from auth.jwt_utils import decode_token
    data = request.get_json()
    if not data or 'refreshToken' not in data:
        return jsonify({'error': 'Missing refresh token'}), 400

    payload = decode_token(data['refreshToken'])
    if not payload or payload.get('type') != 'refresh':
        return jsonify({'error': 'Invalid refresh token'}), 401

    user = User.query.get(payload['sub'])
    if not user:
        return jsonify({'error': 'User not found'}), 401

    access_token = create_access_token(user.id)

    return jsonify({
        'user': user.to_dict(),
        'accessToken': access_token,
    })


@oauth_bp.route('/me', methods=['GET'])
def get_me():
    """Get current user profile."""
    from auth.jwt_utils import decode_token
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Not authenticated'}), 401

    payload = decode_token(auth_header[7:])
    if not payload:
        return jsonify({'error': 'Invalid token'}), 401

    user = User.query.get(payload['sub'])
    if not user:
        return jsonify({'error': 'User not found'}), 401

    return jsonify(user.to_dict())
