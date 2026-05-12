import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv

# Load .env from the project root when running locally.
# In Render, environment variables are provided by the platform.
root_env = Path(__file__).resolve().parents[1] / ".env"
if root_env.exists():
    load_dotenv(root_env)
else:
    load_dotenv(find_dotenv())

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.environ.get("SENDER_EMAIL")
SENDER_PASSWORD = os.environ.get("SENDER_PASSWORD")

if not SENDER_EMAIL or not SENDER_PASSWORD:
    print("[email_utils] WARNING: SENDER_EMAIL or SENDER_PASSWORD not set.")
else:
    print(f"[email_utils] Loaded sender email: {SENDER_EMAIL}")

def send_registration_email(to_email, name):
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print("Email credentials not set. Skipping registration email.")
        return
        
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "Welcome to Credit Scoring App!"
        
        body = f"Hello {name},\n\nThank you for registering to our Credit Scoring App!\n\nBest regards,\nThe Team"
        msg.attach(MIMEText(body, 'plain'))
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        print(f"Registration email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send registration email to {to_email}: {e}")

def send_prediction_result_email(to_email, name, score, decision):
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print("Email credentials not set. Skipping prediction result email.")
        return
        
    if not to_email:
        print("No email provided for prediction result.")
        return
        
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "Your Credit Score Result"
        
        body = f"Hello {name},\n\nHere is your credit score result:\n\nScore: {score}\nDecision: {decision}\n\nBest regards,\nThe Team"
        msg.attach(MIMEText(body, 'plain'))
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        print(f"Prediction result email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send prediction result email to {to_email}: {e}")
