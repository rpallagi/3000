"""AI Voice Tutor — Claude-powered English conversation practice."""
from flask import Blueprint, request, jsonify, current_app, g
from auth.jwt_utils import login_required

tutor_bp = Blueprint('tutor', __name__, url_prefix='/api/tutor')


SYSTEM_PROMPT = """You are a friendly, encouraging English tutor for Hungarian speakers learning at A1-A2 level.

Rules:
- Keep responses SHORT (1-2 sentences maximum)
- Use simple English words
- If the student makes a grammar mistake, gently correct it
- If the student speaks Hungarian, translate it to English and teach the correct phrase
- Praise correct usage
- Focus on the vocabulary words the student is currently learning
- You can mix in a bit of Hungarian for encouragement (e.g., "Szuper!", "Nagyon jó!")
- Never use complex grammar explanations — show by example instead
- If the student seems stuck, give them a simple prompt or question to respond to

You are part of the PlayENG platform teaching the Oxford 3000 most common English words."""


@tutor_bp.route('/chat', methods=['POST'])
@login_required
def chat():
    """Send a message to the AI tutor and get a response."""
    api_key = current_app.config.get('CLAUDE_API_KEY')
    if not api_key:
        return jsonify({'error': 'AI tutor not configured'}), 503

    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Missing message'}), 400

    user_message = data['message'].strip()
    if not user_message:
        return jsonify({'error': 'Empty message'}), 400
    if len(user_message) > 500:
        return jsonify({'error': 'Message too long'}), 400

    # Build conversation context
    chapter_words = data.get('chapterWords', [])
    conversation_history = data.get('history', [])

    # Add chapter context to system prompt
    system = SYSTEM_PROMPT
    if chapter_words:
        words_str = ', '.join(chapter_words[:20])
        system += f'\n\nThe student is currently learning these words: {words_str}. Try to use them in conversation.'

    # Build messages for Claude
    messages = []
    for msg in conversation_history[-10:]:  # Keep last 10 messages
        role = msg.get('role', 'user')
        content = msg.get('content', '')
        if role in ('user', 'assistant') and content:
            messages.append({'role': role, 'content': content})

    messages.append({'role': 'user', 'content': user_message})

    import requests as http_requests
    try:
        resp = http_requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            json={
                'model': 'claude-haiku-4-5-20251001',
                'max_tokens': 150,
                'system': system,
                'messages': messages,
            },
            timeout=15,
        )

        if resp.status_code != 200:
            return jsonify({'error': 'AI service error'}), 502

        result = resp.json()
        reply = result['content'][0]['text']

        return jsonify({
            'reply': reply,
            'role': 'assistant',
        })

    except http_requests.RequestException:
        return jsonify({'error': 'AI service unavailable'}), 502


@tutor_bp.route('/pronunciation-feedback', methods=['POST'])
@login_required
def pronunciation_feedback():
    """Get feedback on pronunciation attempt (from speech-to-text result)."""
    api_key = current_app.config.get('CLAUDE_API_KEY')
    if not api_key:
        return jsonify({'error': 'AI tutor not configured'}), 503

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    expected = data.get('expected', '').strip()
    spoken = data.get('spoken', '').strip()

    if not expected or not spoken:
        return jsonify({'error': 'Missing expected or spoken text'}), 400

    import requests as http_requests
    try:
        resp = http_requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            json={
                'model': 'claude-haiku-4-5-20251001',
                'max_tokens': 100,
                'system': 'You are a pronunciation coach. Compare what the student said vs what was expected. Give brief, encouraging feedback in simple English. Max 1-2 sentences.',
                'messages': [{
                    'role': 'user',
                    'content': f'Expected: "{expected}"\nStudent said: "{spoken}"\n\nGive brief feedback.',
                }],
            },
            timeout=10,
        )

        if resp.status_code != 200:
            return jsonify({'error': 'AI service error'}), 502

        result = resp.json()
        feedback = result['content'][0]['text']

        return jsonify({'feedback': feedback})

    except http_requests.RequestException:
        return jsonify({'error': 'AI service unavailable'}), 502
