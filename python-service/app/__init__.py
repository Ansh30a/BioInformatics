from flask import Flask, request
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # Get CORS origins from environment or use defaults
    cors_origins = os.environ.get('CORS_ORIGINS', 
        'http://localhost:5173,http://localhost:3000,https://bio-informatics.vercel.app'
    ).split(',')
    
    # Enable CORS for all routes
    CORS(app, origins=cors_origins, supports_credentials=True)
    
    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # Reduce to 50MB for cloud deployment
    app.config['UPLOAD_FOLDER'] = 'temp_uploads'
    app.config['JSON_AS_ASCII'] = False
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Add request timeout handler
    @app.before_request
    def before_request():
        request.environ.setdefault('wsgi.url_scheme', 'https')
    
    # Register blueprints
    from app.routes import bp
    app.register_blueprint(bp, url_prefix='/api')
    
    return app
