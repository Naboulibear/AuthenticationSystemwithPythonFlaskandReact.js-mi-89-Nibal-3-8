"""
This module takes care of common functionality
"""
import os
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import jsonify

class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        super().__init__()
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)


def generate_sitemap(app):
    links = []
    for rule in app.url_map.iter_rules():
        # if has_no_empty_params(rule):
        url = url_for(rule.endpoint, **(rule.defaults or {}))
        if "GET" in rule.methods:
            links.append(
                {
                    "name": rule.endpoint,
                    "methods": ["GET"],
                    "url": url,
                }
            )
    links.append(
        {
            "name": "negative",
            "methods": ["GET"],
            "url": "/negative",
        }
    )
    return links


# JWT Token functions
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-this')


def create_token(user_id, email):
    """
    Create a JWT token with user information
    """
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=30),
        'iat': datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token


def verify_token(token):
    """
    Verify and decode a JWT token
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    """
    Decorator to protect routes that require authentication
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        from flask import request
        
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid token'}), 401
        
        token = auth_header.split(' ')[1]
        user_data = verify_token(token)
        
        if not user_data:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function
