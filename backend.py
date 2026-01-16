import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv

# Load environment variables
load_dotenv()  # This will look for a .env file by default

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('.', path)

@app.route('/send', methods=['POST'])
def send_email():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    subject = data.get('subject')
    message = data.get('message')

    if not all([name, email, subject, message]):
        return jsonify({'message': 'Please fill out all fields.'}), 400

    # Basic email validation could be added here

    my_email = os.getenv('MY_EMAIL')
    my_password = os.getenv('MY_PASSWORD')

    if not my_email or not my_password:
        print("Error: Email credentials not found in environment variables.")
        return jsonify({'message': 'Server configuration error.'}), 500

    try:
        # Create message for the developer
        msg_dev = MIMEMultipart()
        msg_dev['From'] = f"Portfolio Website <{my_email}>"
        msg_dev['To'] = 'fut0r@tuta.io'
        msg_dev['Subject'] = f"New Contact Message from {name}"
        
        body_dev = f"""
        <h3>📩 New Message from {name}</h3>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Message:</strong><br>{message}</p>
        """
        msg_dev.attach(MIMEText(body_dev, 'html'))

        # Create confirmation message for the user
        msg_user = MIMEMultipart()
        msg_user['From'] = f"FDJTS Portfolio <{my_email}>"
        msg_user['To'] = email
        msg_user['Subject'] = 'Thanks for contacting us! شكراً لتواصلك معنا'
        
        body_user = f"""
        <h3>Hello {name},</h3>
        <p>Thanks for your message! We'll get back to you ASAP!</p>
        <hr>
        <p><strong>Your message:</strong></p>
        <p>{message}</p>
        <br>
        <p>شكرا لتواصلك معي سيتم الرد عليك قريبا .</p>
        """
        msg_user.attach(MIMEText(body_user, 'html'))

        # Connect to Gmail SMTP server
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(my_email, my_password)
            server.send_message(msg_dev)
            server.send_message(msg_user)

        return jsonify({'message': 'Message sent successfully!'})

    except Exception as e:
        print(f"SendMail Error: {e}")
        return jsonify({'message': 'Failed to send email.'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Run slightly different than nodejs to avoid conflict if both run, or same port if replacing
    print(f"Starting Python/Flask server on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
