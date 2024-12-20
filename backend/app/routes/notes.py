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
        if not hasattr(current_app, 'db'):
            logger.error("Database not initialized")
            return jsonify({'error': 'Database not initialized'}), 500
            
        notes = list(current_app.db.notes.find().sort('order', 1))
        
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

        # Initialize based on note type
        note_type = note_data.get('type', 'standard')
        if note_type == 'task':
            note_data.setdefault('tasks', [])  # Initialize empty tasks list if not provided
            note_data.setdefault('content', '')  # Set empty content for task notes
        else:
            note_data.setdefault('content', '')  # Set empty content for standard notes

        # Common fields
        note_data.setdefault('title', '')
        note_data.setdefault('timestamp', '')
        
        # Get the maximum order value
        last_note = current_app.db.notes.find_one(
            sort=[("order", -1)]
        )
        note_data['order'] = (last_note['order'] + 1000 if last_note else 0)
            
        result = current_app.db.notes.insert_one(note_data)
        inserted_note = current_app.db.notes.find_one({'_id': result.inserted_id})
        inserted_note['_id'] = str(inserted_note['_id'])
        
        logger.debug(f"Created note with ID: {inserted_note['_id']}")
        return jsonify(inserted_note), 201
        
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<note_id>', methods=['PUT'])
def update_note(note_id):
    """Update a note"""
    logger.debug(f"PUT /api/notes/{note_id} endpoint called")
    try:
        if not hasattr(current_app, 'db'):
            logger.error("Database not initialized")
            return jsonify({'error': 'Database not initialized'}), 500
            
        note_data = request.get_json()
        if not note_data:
            return jsonify({'error': 'No data provided'}), 400

        update_data = {
            'title': note_data.get('title', ''),
            'order': note_data.get('order'),
            'type': note_data.get('type', 'standard')
        }

        # Handle content based on note type
        if update_data['type'] == 'task':
            update_data['tasks'] = note_data.get('tasks', [])
        else:
            update_data['content'] = note_data.get('content', '')
        
        result = current_app.db.notes.update_one(
            {'_id': ObjectId(note_id)},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Note not found'}), 404
            
        updated_note = current_app.db.notes.find_one({'_id': ObjectId(note_id)})
        updated_note['_id'] = str(updated_note['_id'])
        
        logger.debug(f"Updated note {note_id}")
        return jsonify(updated_note), 200
        
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Delete a note"""
    logger.debug(f"DELETE /api/notes/{note_id} endpoint called")
    try:
        if not hasattr(current_app, 'db'):
            logger.error("Database not initialized")
            return jsonify({'error': 'Database not initialized'}), 500
            
        result = current_app.db.notes.delete_one({'_id': ObjectId(note_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Note not found'}), 404
            
        return jsonify({'message': 'Note deleted successfully'}), 200
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({'error': str(e)}), 500