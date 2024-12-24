from flask import Flask, request
from flask_cors import CORS
from pymongo import MongoClient, ASCENDING, DESCENDING
import logging
from datetime import datetime

def create_indexes(db):
    """Create necessary indexes for the application"""
    try:
        # Notes collection indexes
        db.notes.create_index([
            ("cabinet_id", ASCENDING),
            ("order", ASCENDING)
        ])
        # Cabinets collection indexes
        db.cabinets.create_index("name", unique=True)
        db.cabinets.create_index("created_at")
        logging.info("Database indexes created successfully")
    except Exception as e:
        logging.error(f"Error creating indexes: {str(e)}")
        raise

def ensure_default_cabinet(db):
    """Ensure a default cabinet exists"""
    try:
        default_cabinet = db.cabinets.find_one({"name": "Default Cabinet"})
        if not default_cabinet:
            now = datetime.utcnow()
            result = db.cabinets.insert_one({
                "name": "Default Cabinet",
                "created_at": now,
                "updated_at": now
            })
            default_cabinet_id = str(result.inserted_id)
            logging.info("Default cabinet created successfully")
            # Update any existing notes without cabinet_id
            db.notes.update_many(
                {"cabinet_id": {"$exists": False}},
                {"$set": {"cabinet_id": default_cabinet_id}}
            )
        else:
            default_cabinet_id = str(default_cabinet["_id"])
            logging.info("Default cabinet already exists")
        return default_cabinet_id
    except Exception as e:
        logging.error(f"Error ensuring default cabinet: {str(e)}")
        raise

def create_app(test_config=None):
    """Create and configure the Flask application"""
    app = Flask(__name__, instance_relative_config=True)

    # Setup logging
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s [%(levelname)s] %(message)s'
    )
    logger = logging.getLogger(__name__)

    # Load configuration
    if test_config is None:
        app.config.from_object('config.Config')
    else:
        app.config.update(test_config)

    # Setup CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Request logging middleware
    @app.before_request
    def log_request():
        logger.debug(f"Request: {request.method} {request.url}")
        logger.debug(f"Headers: {dict(request.headers)}")
        logger.debug(f"Data: {request.get_data()}")

    # Initialize MongoDB connection
    try:
        client = MongoClient(app.config['MONGO_URI'])
        db = client.get_database()
        app.db = db

        # Create indexes
        create_indexes(db)

        # Ensure default cabinet exists
        default_cabinet_id = ensure_default_cabinet(db)
        app.config['DEFAULT_CABINET_ID'] = default_cabinet_id

        logging.info("Database connection established successfully")
    except Exception as e:
        logging.error(f"Error connecting to database: {str(e)}")
        raise

    # Register blueprints
    from .routes import notes, cabinets
    app.register_blueprint(notes.bp)
    app.register_blueprint(cabinets.bp)

    # Test route
    @app.route('/api/healthcheck')
    def healthcheck():
        return {'status': 'ok', 'timestamp': datetime.utcnow().isoformat()}

    return app