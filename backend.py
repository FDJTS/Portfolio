from flask import Flask, request, jsonify
import smtplib
from email.message import EmailMessage
import os
from flask_cors import CORS
import re
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime

app = Flask(__name__)
CORS(app)
limiter = Limiter(app, key_func=get_remote_address, default_limits=["5 per minute"])

EMAIL_ADDRESS = 'fdjts1@gmail.com'
EMAIL_PASSWORD = os.environ.get('FDJTS_EMAIL_PASS')

def is_valid_email(email):
    return re.match(r"^[^@]+@[^@]+\.[^@]+$", email)

def log_message(name, email, message):
    with open("messages.log", "a", encoding="utf-8") as f:
        f.write(f"{datetime.now()} | {name} | {email} | {message}\n")

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
@limiter.limit("2 per minute")
def contact():
    data = request.get_json(force=True)
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    message = data.get('message', '').strip()

    # تحقق قوي من صحة البيانات
    if not name or len(name) < 2 or len(name) > 40 or not re.match(r"^[\w\s\-ء-ي]+$", name):
        return jsonify({'error': 'يرجى إدخال اسم صحيح.'}), 400
    if not is_valid_email(email):
        return jsonify({'error': 'يرجى إدخال بريد إلكتروني صحيح.'}), 400
    if not message or len(message) < 10 or len(message) > 2000:
        return jsonify({'error': 'يرجى كتابة رسالة مناسبة.'}), 400

    # سجل الرسالة في ملف
    log_message(name, email, message)

    # رسالة لصاحب الموقع
    subject_admin = f'رسالة جديدة من موقعك: {name}'
    body_admin = f"الاسم: {name}\nالبريد: {email}\n\nالرسالة:\n{message}\n\n---\nسيتم الرد عليك قريباً على بريدك الشخصي."
    # رسالة تلقائية للمرسل
    subject_user = "تم استلام رسالتك في موقع FDJTS"
    body_user = f"""مرحباً {name},

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
    app.run(host='0.0.0.0', port=5000)
