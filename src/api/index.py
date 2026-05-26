"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt

# Create Flask app
app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///auth.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-this')

# Initialize database
db = SQLAlchemy(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

# Create tables
with app.app_context():
    db.create_all()

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

# Signup endpoint
@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'message': 'Email already registered'}), 409

        # Create new user
        new_user = User(email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'message': 'User created successfully',
            'user': new_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

# Login endpoint
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        # Find user
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'message': 'Invalid credentials'}), 401

        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['JWT_SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

# User verification endpoint
@app.route('/api/user', methods=['GET'])
def get_user():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'message': 'No token provided'}), 401

        # Verify token
        payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(payload['user_id'])

        if not user:
            return jsonify({'message': 'User not found'}), 404

        return jsonify(user.to_dict()), 200

    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Main entry point
if __name__ == '__main__':
    app.run(debug=True, port=3001)