from app import app  # Import your Flask app instance
from flask_cors import CORS



if __name__ == "__main__":
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['DEBUG'] = True
    CORS(app)
    app.run()
   