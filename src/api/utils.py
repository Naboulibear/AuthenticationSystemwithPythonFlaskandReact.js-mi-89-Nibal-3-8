import os
from datetime import datetime, timedelta, timezone
from functools import wraps

from flask import current_app, jsonify, request
import jwt


def _get_secret_key():
    return current_app.config.get("JWT_SECRET_KEY") or os.getenv("JWT_SECRET_KEY", "super-secret-key")


def generate_token(user):
    payload = {
        "sub": user.id,
        "email": user.email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, _get_secret_key(), algorithm="HS256")


def validate_token(token):
    return jwt.decode(token, _get_secret_key(), algorithms=["HS256"])


def token_required(handler):
    @wraps(handler)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "", 1).strip()

        if not token:
            return jsonify({"message": "Missing token"}), 401

        try:
            payload = validate_token(token)
            from models import User

            user = User.query.get(payload.get("sub"))
            if not user:
                return jsonify({"message": "Invalid token"}), 401
            kwargs["current_user"] = user
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return handler(*args, **kwargs)

    return wrapper
