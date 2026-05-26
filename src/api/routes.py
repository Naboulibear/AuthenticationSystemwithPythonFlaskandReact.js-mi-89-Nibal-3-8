from datetime import datetime, timedelta

from flask import jsonify, request
import jwt


def register_auth_routes(app, db, User):
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok'}), 200

    @app.route('/api/signup', methods=['POST'])
    def signup():
        try:
            data = request.get_json() or {}
            email = data.get('email')
            password = data.get('password')

            if not email or not password:
                return jsonify({'message': 'Email and password are required'}), 400

            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return jsonify({'message': 'Email already registered'}), 409

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

    @app.route('/api/login', methods=['POST'])
    def login():
        try:
            data = request.get_json() or {}
            email = data.get('email')
            password = data.get('password')

            if not email or not password:
                return jsonify({'message': 'Email and password are required'}), 400

            user = User.query.filter_by(email=email).first()
            if not user or not user.check_password(password):
                return jsonify({'message': 'Invalid credentials'}), 401

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

    @app.route('/api/user', methods=['GET'])
    def get_user():
        try:
            token = request.headers.get('Authorization', '').replace('Bearer ', '')

            if not token:
                return jsonify({'message': 'No token provided'}), 401

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
