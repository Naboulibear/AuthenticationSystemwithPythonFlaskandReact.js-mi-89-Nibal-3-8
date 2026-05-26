from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

try:
    from .models import User, db
    from .utils import generate_token, token_required
except ImportError:  # pragma: no cover
    from models import User, db
    from utils import generate_token, token_required


auth_api = Blueprint("auth_api", __name__)


@auth_api.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "Email already registered"}), 409

    try:
        user = User(email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Email already registered"}), 409
    except Exception:
        db.session.rollback()
        return jsonify({"message": "Unable to create user"}), 500

    return jsonify({"message": "User created successfully"}), 201


@auth_api.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = generate_token(user)
    return jsonify({"token": token, "user": user.to_dict()}), 200


@auth_api.route("/private", methods=["GET"])
@token_required
def private(current_user):
    return jsonify({"message": "Access granted", "user": current_user.to_dict()}), 200


@auth_api.route("/logout", methods=["POST"])
@token_required
def logout(current_user):
    return jsonify({"message": "Logged out successfully"}), 200
