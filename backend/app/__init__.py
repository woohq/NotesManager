# backend/app/__init__.py
from flask import Flask, request, make_response
from pymongo import MongoClient, ASCENDING
from datetime import datetime
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import Config

def create_indexes(db):
    # Drop existing indexes to ensure clean state
    db.cabinets.drop_indexes()
    db.notes.drop_indexes()
    
    """Create necessary database indexes"""
    # Create index for notes order within a cabinet
    db.notes.create_index([
        ('cabinet_id', ASCENDING),
        ('order', ASCENDING)
    ])
    
    # Create index for cabinet names (ensure uniqueness)
    db.cabinets.create_index('name', unique=True)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response()
            response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type"
            response.headers["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE,OPTIONS"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            return response

    @app.after_request
    def after_request(response):
        if request.method != "OPTIONS":
            response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type"
            response.headers["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE,OPTIONS"
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    # Initialize MongoDB
    client = MongoClient(app.config['MONGO_URI'])
    db_name = app.config['MONGO_URI'].split('/')[-1]
    app.db = client[db_name]

    # Set up database
    create_indexes(app.db)

    # Register blueprints
    from .routes import notes, cabinets
    app.register_blueprint(notes.bp)
    app.register_blueprint(cabinets.bp)

    return app