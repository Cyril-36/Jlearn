"""
Email service for password reset and email verification.
Uses SMTP (configurable via env vars). No-ops gracefully when not configured.
"""
import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger("jlearn.email")

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@jlearn.dev")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _send(to: str, subject: str, html: str) -> bool:
    if not SMTP_HOST:
        logger.warning("SMTP not configured — email not sent to %s: %s", to, subject)
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM
        msg["To"] = to
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            if SMTP_USER:
                server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_FROM, to, msg.as_string())
        logger.info("Email sent to %s: %s", to, subject)
        return True
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)
        return False


def send_password_reset(to: str, token: str) -> bool:
    link = f"{FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <h2>Reset your JLearn password</h2>
    <p>Click the link below to set a new password. It expires in 1 hour.</p>
    <p><a href="{link}" style="background:#00cec9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
      Reset Password
    </a></p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    """
    return _send(to, "Reset your JLearn password", html)


def send_verification_email(to: str, token: str) -> bool:
    link = f"{FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <h2>Verify your JLearn email</h2>
    <p>Click below to verify your account.</p>
    <p><a href="{link}" style="background:#6c5ce7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
      Verify Email
    </a></p>
    """
    return _send(to, "Verify your JLearn email", html)
