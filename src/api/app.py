import os

from flask import Flask, jsonify
from flask_cors import CORS

try:
    from .models import db
    from .routes import auth_api
except ImportError:  # pragma: no cover
    from models import db
    from routes import auth_api


def create_app():
    app = Flask(__name__)
    CORS(app)

    jwt_secret = os.getenv("JWT_SECRET_KEY")
    if not jwt_secret:
        if os.getenv("FLASK_ENV", "development") == "development":
            jwt_secret = "dev-secret-key"
        else:
            raise RuntimeError("JWT_SECRET_KEY environment variable is required")

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///auth.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = jwt_secret

    db.init_app(app)

    app.register_blueprint(auth_api, url_prefix="/api")

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    with app.app_context():
        db.create_all()

    return app


app = create_app()


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 3001)), debug=debug_mode)
