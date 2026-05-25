import os
from flask import Flask, send_from_directory
from extensions import db, bcrypt
from models.models import *          # registers all models with SQLAlchemy
from routes.routes import main       # Blueprint with all routes
from routes.api_routes import api_bp # Blueprint for React frontend API
from flask_cors import CORS
from jinja2 import TemplateNotFound
from flask import jsonify, render_template
import mimetypes
from dotenv import load_dotenv
load_dotenv()

# Fix Windows registry MIME type issue for static files
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SECRET_KEY']              = os.getenv('SECRET_KEY')
    app.config['UPLOAD_FOLDER']           = os.getenv('UPLOAD_FOLDER', 'static/uploads')
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialise extensions
    db.init_app(app)
    bcrypt.init_app(app)

    # Register blueprint
    app.register_blueprint(main)
    app.register_blueprint(api_bp)

    # Enable CORS
    CORS(app)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        # Serve any built static asset (JS, CSS, images) directly
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        # Otherwise serve the React app's index.html (SPA routing)
        index_path = os.path.join(app.static_folder, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, 'index.html')
        try:
            return render_template('index.html')
        except TemplateNotFound:
            return (
                "<h2>Frontend not built yet.</h2>"
                "<p>Run <code>npm run build</code> inside the <code>frontend</code> folder, "
                "then refresh this page.</p>",
                404,
            )

    @app.errorhandler(404)
    def not_found(e):
        index_path = os.path.join(app.static_folder, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, 'index.html')
        return jsonify({"error": "Not found"}), 404

    return app


app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
