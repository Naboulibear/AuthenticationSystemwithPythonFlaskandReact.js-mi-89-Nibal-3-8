from flask_sqlalchemy import SQLAlchemy
import bcrypt


db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean(), nullable=False, default=True)

    def set_password(self, password):
        self.password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    def check_password(self, password):
        return bcrypt.checkpw(password.encode("utf-8"), self.password.encode("utf-8"))

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
        }
