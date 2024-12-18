from flask import Blueprint, request, jsonify, current_app
from bson.objectid import ObjectId
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

bp = Blueprint('notes', __name__, url_prefix='/api/notes')

@bp.route('', methods=['GET'])
def get_notes():
    """Get all notes"""
    logger.debug("GET /api/notes endpoint called")
    try:
        # Use current_app instead of bp.app
        if not hasattr(current_app, 'db'):
            logger.error("Database not initialized")
            return jsonify({'error': 'Database not initialized'}), 500
            
        notes = list(current_app.db.notes.find())
        # Convert ObjectId to string for JSON serialization
        for note in notes:
            note['_id'] = str(note['_id'])
        logger.debug(f"Successfully retrieved {len(notes)} notes")
        return jsonify(notes)
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])
def create_note():
    """Create a new note"""
    logger.debug("POST /api/notes endpoint called")
    try:
        if not hasattr(current_app, 'db'):
            logger.error("Database not initialized")
            return jsonify({'error': 'Database not initialized'}), 500
            
        note_data = request.get_json()
        logger.debug(f"Received note data: {note_data}")
        
        if not note_data:
            return jsonify({'error': 'No data provided'}), 400
            
        result = current_app.db.notes.insert_one(note_data)
        note_data['_id'] = str(result.inserted_id)
        logger.debug(f"Created note with ID: {note_data['_id']}")
        return jsonify(note_data), 201
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': str(e)}), 500