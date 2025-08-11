import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

def send_email(to_email, subject, body):
    try:
        # Configuration from environment
        SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
        SMTP_USER = os.getenv("SMTP_USER")
        SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
        
        if not all([SMTP_SERVER, SMTP_USER, SMTP_PASSWORD]):
            print("⚠️ Email not sent - SMTP credentials not configured")
            return False

        # Create message
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        
        # Connect and send
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✉️ Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Email failed: {str(e)}")
        return False