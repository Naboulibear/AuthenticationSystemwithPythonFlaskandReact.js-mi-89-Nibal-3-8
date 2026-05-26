try:
    from .app import app
except ImportError:  # pragma: no cover
    from app import app


if __name__ == "__main__":
    app.run()
