import os
import secrets
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

AUDIT_PASSWORD = os.getenv("AUDIT_PASSWORD", "cyruschau0904")
AUDIT_SESSIONS = set()
VISIT_LOG = []


def describe_device(user_agent):
    text = user_agent.lower()
    device = "Mobile" if any(name in text for name in ["iphone", "android", "mobile"]) else "Desktop"
    if "edg" in text:
        browser = "Microsoft Edge"
    elif "chrome" in text:
        browser = "Chrome"
    elif "safari" in text:
        browser = "Safari"
    elif "firefox" in text:
        browser = "Firefox"
    else:
        browser = "Unknown browser"
    return f"{device} / {browser}"


def audit_authorized():
    header = request.headers.get("Authorization", "")
    token = header.removeprefix("Bearer ").strip()
    return token in AUDIT_SESSIONS


@app.get("/api/health")
def health():
    return jsonify(
        status="ok",
        message="Flask backend is connected!",
    )


@app.post("/api/audit/visit")
def record_visit():
    data = request.get_json(silent=True) or {}
    user_agent = request.headers.get("User-Agent", "")
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    ip_address = forwarded_for.split(",")[0].strip() or request.remote_addr or "Unknown"
    VISIT_LOG.append(
        {
            "id": len(VISIT_LOG) + 1,
            "visitedAt": datetime.now(timezone.utc).isoformat(),
            "path": data.get("path", "/"),
            "referrer": data.get("referrer") or "Direct",
            "language": request.headers.get("Accept-Language", "Unknown"),
            "timezone": data.get("timezone", "Unknown"),
            "screen": data.get("screen", "Unknown"),
            "viewport": data.get("viewport", "Unknown"),
            "ipAddress": ip_address,
            "userAgent": user_agent,
            "visitorType": describe_device(user_agent),
        }
    )
    del VISIT_LOG[:-100]
    return jsonify(status="recorded")


@app.post("/api/audit/login")
def audit_login():
    data = request.get_json(silent=True) or {}
    if str(data.get("password", "")).strip() != AUDIT_PASSWORD:
        return jsonify(error="Invalid password"), 401
    token = secrets.token_urlsafe(32)
    AUDIT_SESSIONS.add(token)
    return jsonify(token=token)


@app.get("/api/audit/visits")
def audit_visits():
    if not audit_authorized():
        return jsonify(error="Unauthorized"), 401
    return jsonify(visits=list(reversed(VISIT_LOG)))


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "true").lower() == "true",
    )
