from flask import Flask, request, jsonify
import smtplib
from email.message import EmailMessage
import os
from flask_cors import CORS
import re
from time import time

app = Flask(__name__)
CORS(app)

EMAIL_ADDRESS = 'fdjts1@gmail.com'
EMAIL_PASSWORD = os.environ.get('FDJTS_EMAIL_PASS')

rate_limit = {}
RATE_LIMIT_SECONDS = 30

def is_valid_email(email):
    return re.match(r"^[^@]+@[^@]+\.[^@]+$", email)

def send_email(to, subject, body):
    email_msg = EmailMessage()
    email_msg['Subject'] = subject
    email_msg['From'] = EMAIL_ADDRESS
    email_msg['To'] = to
    email_msg.set_content(body)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        smtp.send_message(email_msg)

@app.route('/api/contact', methods=['POST'])
def contact():
    ip = request.remote_addr
    now = time()
    last = rate_limit.get(ip, 0)
    if now - last < RATE_LIMIT_SECONDS:
        return jsonify({'error': 'يرجى الانتظار قليلاً قبل إعادة الإرسال.'}), 429
    rate_limit[ip] = now

    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    message = data.get('message', '').strip()

    if not name or len(name) < 2 or len(name) > 40:
        return jsonify({'error': 'يرجى إدخال اسم صحيح.'}), 400
    if not is_valid_email(email):
        return jsonify({'error': 'يرجى إدخال بريد إلكتروني صحيح.'}), 400
    if not message or len(message) < 10 or len(message) > 2000:
        return jsonify({'error': 'يرجى كتابة رسالة مناسبة.'}), 400

    subject_admin = f'رسالة جديدة من موقعك: {name}'
    body_admin = f"الاسم: {name}\nالبريد: {email}\n\nالرسالة:\n{message}\n\n---\nسيتم الرد عليك قريباً على بريدك الشخصي."

    subject_user = "تم استلام رسالتك في موقع FDJTS"
    body_user = f"""مرحباً {name}،

تم استلام رسالتك بنجاح على موقع FDJTS.
سيتم الرد عليك قريباً على بريدك الشخصي.

نص رسالتك:
-----------------
{message}
-----------------

شكراً لتواصلك معنا!
"""

    try:
        send_email(EMAIL_ADDRESS, subject_admin, body_admin)
        send_email(email, subject_user, body_user)
        return jsonify({'success': True, 'msg': 'تم إرسال رسالتك بنجاح! سيتم الرد عليك قريباً على بريدك الشخصي.'})
    except smtplib.SMTPAuthenticationError:
        return jsonify({'error': 'خطأ في إعدادات البريد، يرجى مراجعة كلمة المرور.'}), 500
    except Exception as e:
        print(f"Email send error: {e}")
        return jsonify({'error': 'حدث خطأ أثناء إرسال الرسالة.'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
