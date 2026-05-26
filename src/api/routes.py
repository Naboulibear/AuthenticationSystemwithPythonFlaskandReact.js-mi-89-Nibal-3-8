"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import request, jsonify, Blueprint
from api.models import db, User
from api.utils import APIException, create_token, verify_token
from flask_cors import CORS

api = Blueprint('api', __name__)
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend"
    }
    return jsonify(response_body), 200


@api.route('/signup', methods=['POST'])
def signup():
    try:
        body = request.get_json()
        
        if not body or 'email' not in body or 'password' not in body:
            return jsonify({"error": "Email and password are required"}), 400
        
        email = body.get('email')
        password = body.get('password')
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "User with this email already exists"}), 400
        
        # Create new user
        new_user = User(email=email)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "message": "User created successfully",
            "user": new_user.serialize()
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/login', methods=['POST'])
def login():
    try:
        body = request.get_json()
        
        if not body or 'email' not in body or 'password' not in body:
            return jsonify({"error": "Email and password are required"}), 400
        
        email = body.get('email')
        password = body.get('password')
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Generate token
        token = create_token(user.id, user.email)
        
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": user.serialize()
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/private', methods=['GET'])
def private():
    try:
        # Get token from headers
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return jsonify({"error": "Missing or invalid token"}), 401
        
        token = auth_header.split(' ')[1]
        user_data = verify_token(token)
        
        if not user_data:
            return jsonify({"error": "Invalid token"}), 401
        
        user = User.query.get(user_data.get('user_id'))
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "message": "Access granted to private area",
            "user": user.serialize()
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
