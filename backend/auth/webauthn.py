"""WebAuthn (Face ID / Touch ID) registration and authentication."""
import base64
from flask import Blueprint, request, jsonify, current_app, g, session
from models.db import db
from models.user import User, WebAuthnCredential
from auth.jwt_utils import login_required, create_access_token, create_refresh_token

webauthn_bp = Blueprint('webauthn', __name__, url_prefix='/api/auth/webauthn')


@webauthn_bp.route('/register/options', methods=['POST'])
@login_required
def register_options():
    """Generate WebAuthn registration options for the current user."""
    from webauthn import generate_registration_options
    from webauthn.helpers.structs import (
        AuthenticatorSelectionCriteria,
        ResidentKeyRequirement,
        UserVerificationRequirement,
    )

    user = User.query.get(g.user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    existing_creds = WebAuthnCredential.query.filter_by(user_id=user.id).all()
    exclude = [
        {'id': base64.urlsafe_b64encode(c.credential_id).rstrip(b'=').decode(), 'type': 'public-key'}
        for c in existing_creds
    ]

    options = generate_registration_options(
        rp_id=current_app.config['RP_ID'],
        rp_name=current_app.config['RP_NAME'],
        user_id=str(user.id).encode(),
        user_name=user.email,
        user_display_name=user.name,
        authenticator_selection=AuthenticatorSelectionCriteria(
            resident_key=ResidentKeyRequirement.PREFERRED,
            user_verification=UserVerificationRequirement.PREFERRED,
        ),
        exclude_credentials=exclude,
    )

    # Store challenge in session for verification
    session['webauthn_challenge'] = base64.b64encode(options.challenge).decode()

    from webauthn.helpers import options_to_json
    return jsonify(options_to_json(options))


@webauthn_bp.route('/register/verify', methods=['POST'])
@login_required
def register_verify():
    """Verify WebAuthn registration and store credential."""
    from webauthn import verify_registration_response
    from webauthn.helpers.structs import RegistrationCredential

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    challenge = base64.b64decode(session.get('webauthn_challenge', ''))
    if not challenge:
        return jsonify({'error': 'No challenge found'}), 400

    try:
        verification = verify_registration_response(
            credential=RegistrationCredential.parse_raw(request.data),
            expected_challenge=challenge,
            expected_rp_id=current_app.config['RP_ID'],
            expected_origin=current_app.config['RP_ORIGIN'],
        )
    except Exception as e:
        return jsonify({'error': f'Verification failed: {str(e)}'}), 400

    device_name = data.get('deviceName', 'Unknown device')

    cred = WebAuthnCredential(
        user_id=g.user_id,
        credential_id=verification.credential_id,
        public_key=verification.credential_public_key,
        sign_count=verification.sign_count,
        device_name=device_name,
    )
    db.session.add(cred)
    db.session.commit()

    session.pop('webauthn_challenge', None)

    return jsonify({'success': True, 'deviceName': device_name})


@webauthn_bp.route('/login/options', methods=['POST'])
def login_options():
    """Generate WebAuthn authentication options."""
    from webauthn import generate_authentication_options
    from webauthn.helpers.structs import UserVerificationRequirement

    options = generate_authentication_options(
        rp_id=current_app.config['RP_ID'],
        user_verification=UserVerificationRequirement.PREFERRED,
    )

    session['webauthn_challenge'] = base64.b64encode(options.challenge).decode()

    from webauthn.helpers import options_to_json
    return jsonify(options_to_json(options))


@webauthn_bp.route('/login/verify', methods=['POST'])
def login_verify():
    """Verify WebAuthn authentication and return JWT."""
    from webauthn import verify_authentication_response
    from webauthn.helpers.structs import AuthenticationCredential

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    challenge = base64.b64decode(session.get('webauthn_challenge', ''))
    if not challenge:
        return jsonify({'error': 'No challenge found'}), 400

    # Find credential by ID
    raw_id = base64.urlsafe_b64decode(data.get('rawId', '') + '==')
    cred = WebAuthnCredential.query.filter_by(credential_id=raw_id).first()
    if not cred:
        return jsonify({'error': 'Credential not found'}), 401

    try:
        verification = verify_authentication_response(
            credential=AuthenticationCredential.parse_raw(request.data),
            expected_challenge=challenge,
            expected_rp_id=current_app.config['RP_ID'],
            expected_origin=current_app.config['RP_ORIGIN'],
            credential_public_key=cred.public_key,
            credential_current_sign_count=cred.sign_count,
        )
    except Exception as e:
        return jsonify({'error': f'Authentication failed: {str(e)}'}), 401

    cred.sign_count = verification.new_sign_count
    db.session.commit()

    user = User.query.get(cred.user_id)
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    session.pop('webauthn_challenge', None)

    return jsonify({
        'user': user.to_dict(),
        'accessToken': access_token,
        'refreshToken': refresh_token,
    })
