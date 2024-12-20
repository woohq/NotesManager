from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from config import Config
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Configure CORS with more specific settings
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Initialize MongoDB connection
    try:
        logger.debug("Attempting to connect to MongoDB...")
        client = MongoClient(app.config['MONGO_URI'])
        # Test the connection
        client.admin.command('ping')
        app.db = client.notes_manager
        logger.debug("Successfully connected to MongoDB!")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        app.db = None

    # Register blueprints
    from app.routes import notes, cabinets
    app.register_blueprint(notes.bp)
    app.register_blueprint(cabinets.bp)
    
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

    @app.route('/health')
    def health_check():
        status = 'healthy' if app.db else 'database disconnected'
        return jsonify({'status': status})

    return app