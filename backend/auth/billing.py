"""OTP SimplePay subscription billing integration."""
import hashlib
import hmac
import json
import time
from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify, current_app, g
from models.db import db
from models.user import User
from auth.jwt_utils import login_required

billing_bp = Blueprint('billing', __name__, url_prefix='/api/billing')

# SimplePay API endpoints
SIMPLEPAY_SANDBOX_URL = 'https://sandbox.simplepay.hu/payment/v2/start'
SIMPLEPAY_LIVE_URL = 'https://secure.simplepay.hu/payment/v2/start'


def get_simplepay_url():
    if current_app.config.get('SIMPLEPAY_SANDBOX', True):
        return SIMPLEPAY_SANDBOX_URL
    return SIMPLEPAY_LIVE_URL


def simplepay_signature(data: dict) -> str:
    """Generate SimplePay HMAC-SHA384 signature."""
    secret = current_app.config['SIMPLEPAY_SECRET_KEY']
    payload = json.dumps(data, separators=(',', ':'))
    return hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha384
    ).hexdigest()


@billing_bp.route('/subscribe', methods=['POST'])
@login_required
def start_subscription():
    """Start SimplePay payment for premium subscription."""
    user = User.query.get(g.user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.is_premium:
        return jsonify({'error': 'Already premium'}), 400

    merchant_id = current_app.config['SIMPLEPAY_MERCHANT_ID']
    if not merchant_id:
        return jsonify({'error': 'Payment not configured'}), 503

    order_ref = f'playeng-{user.id}-{int(time.time())}'

    # SimplePay start payment request
    payment_data = {
        'merchant': merchant_id,
        'orderRef': order_ref,
        'customer': user.email,
        'customerEmail': user.email,
        'language': 'HU',
        'currency': 'HUF',
        'total': '2990',
        'methods': ['CARD'],
        'url': f'{current_app.config["RP_ORIGIN"]}/api/billing/callback',
        'timeout': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S+00:00'),
        'invoice': {
            'name': user.name,
            'company': '',
            'country': 'HU',
            'state': '',
            'city': '',
            'zip': '',
            'address': '',
            'phone': '',
        },
    }

    import requests
    try:
        headers = {
            'Content-Type': 'application/json',
            'Signature': simplepay_signature(payment_data),
        }
        resp = requests.post(
            get_simplepay_url(),
            json=payment_data,
            headers=headers,
            timeout=15,
        )
        result = resp.json()

        if 'paymentUrl' in result:
            return jsonify({
                'paymentUrl': result['paymentUrl'],
                'transactionId': result.get('transactionId'),
                'orderRef': order_ref,
            })
        else:
            return jsonify({'error': 'Payment initiation failed', 'details': result}), 502

    except requests.RequestException as e:
        return jsonify({'error': 'Payment service unavailable'}), 502


@billing_bp.route('/callback', methods=['GET', 'POST'])
def payment_callback():
    """SimplePay IPN callback — payment completed."""
    # SimplePay sends back with query params or POST
    if request.method == 'GET':
        # Redirect back after payment
        r = request.args.get('r')
        s = request.args.get('s')
    else:
        data = request.get_json() or {}
        r = data.get('r')
        s = data.get('s')

    if not r:
        return jsonify({'error': 'Missing payment response'}), 400

    # Decode base64 response
    import base64
    try:
        response_data = json.loads(base64.b64decode(r))
    except Exception:
        return jsonify({'error': 'Invalid payment response'}), 400

    order_ref = response_data.get('o', '')
    status = response_data.get('e', '')

    if status == 'SUCCESS':
        # Extract user_id from order_ref (format: playeng-{user_id}-{timestamp})
        parts = order_ref.split('-')
        if len(parts) >= 3:
            try:
                user_id = int(parts[1])
                user = User.query.get(user_id)
                if user:
                    user.subscription_status = 'premium'
                    user.subscription_expires_at = datetime.now(timezone.utc) + timedelta(days=30)
                    db.session.commit()
            except (ValueError, IndexError):
                pass

    # Redirect user back to app
    return f'''
    <html><head>
    <meta http-equiv="refresh" content="0;url={current_app.config['RP_ORIGIN']}/subscription?status={status}">
    </head></html>
    '''


@billing_bp.route('/status', methods=['GET'])
@login_required
def subscription_status():
    """Get current subscription status."""
    user = User.query.get(g.user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'status': user.subscription_status,
        'isPremium': user.is_premium,
        'expiresAt': user.subscription_expires_at.isoformat() if user.subscription_expires_at else None,
    })
