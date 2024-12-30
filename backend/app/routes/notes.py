from flask import Blueprint, request, jsonify, current_app, make_response
import logging
import bleach
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

bp = Blueprint('notes', __name__, url_prefix='/api/notes')

@bp.route('', methods=['OPTIONS'])
def handle_options():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add("Access-Control-Max-Age", "3600")
    return response

def sanitize_html(content):
    if not content:
        return ''
        
    # Define allowed tags and attributes
    allowed_tags = [
        'p', 'div', 'span',
        'h1', 'h2', 'h3',
        'strong', 'em', 'u', 's',
        'ul', 'ol', 'li',
        'pre', 'code',
        'blockquote', 'a',
        'input'
    ]
    
    allowed_attributes = {
        '*': ['class', 'style', 'data-type'],
        'a': ['href'],
        'input': ['type', 'checked']
    }
    
    # Clean the HTML
    cleaned_html = bleach.clean(
        content,
        tags=allowed_tags,
        attributes=allowed_attributes,
        strip=True
    )
    
    return cleaned_html

@bp.route('', methods=['GET'])
def get_notes():
    """Get all notes, optionally filtered by cabinet"""
    logger.debug("GET /api/notes endpoint called")
    try:
        if not hasattr(current_app, 'db'):
            logger.error("Database not initialized")
            return jsonify({'error': 'Database not initialized'}), 500
            
        # Get cabinet_id from query parameters
        cabinet_id = request.args.get('cabinet_id')
        
        # Build query
        query = {}
        if cabinet_id:
            query['cabinet_id'] = cabinet_id
            
        notes = list(current_app.db.notes.find(query).sort('order', 1))
        
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
    note_data = request.get_json()
    logger.debug(f"Raw note data received: {note_data}")
    try:
        if not hasattr(current_app, 'db'):
            return jsonify({'error': 'Database not initialized'}), 500
            
        note_data = request.get_json()
        
        if not note_data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Validate cabinet_id
        cabinet_id = note_data.get('cabinet_id')
        if not cabinet_id:
            return jsonify({'error': 'cabinet_id is required'}), 400
            
        # Verify cabinet exists
        cabinet = current_app.db.cabinets.find_one({'_id': ObjectId(cabinet_id)})
        if not cabinet:
            return jsonify({'error': 'Cabinet not found'}), 404

        # Sanitize HTML content if present
        if 'content' in note_data:
            note_data['content'] = sanitize_html(note_data['content'])

        # Initialize based on note type
        note_type = note_data.get('type', 'standard')
        if note_type == 'task':
            note_data.setdefault('tasks', [])
            note_data.setdefault('content', '')
        elif note_type == 'calendar':
            note_data.setdefault('viewType', 'month')
            note_data.setdefault('calendarData', [])
            note_data.setdefault('views', [{
                'id': 'view-1',
                'viewType': 'month',
                'selectedDate': note_data.get('timestamp')
            }])
            note_data.setdefault('content', '')
        else:
            note_data.setdefault('content', '')

        # Common fields
        note_data.setdefault('title', '')
        note_data.setdefault('timestamp', '')
        
        # Get the maximum order value for the specific cabinet
        last_note = current_app.db.notes.find_one(
            {'cabinet_id': cabinet_id},
            sort=[("order", -1)]
        )
        note_data['order'] = (last_note['order'] + 1000 if last_note else 0)
            
        result = current_app.db.notes.insert_one(note_data)
        inserted_note = current_app.db.notes.find_one({'_id': result.inserted_id})
        inserted_note['_id'] = str(inserted_note['_id'])
        
        return jsonify(inserted_note), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

from flask import Blueprint, request, jsonify, current_app
from bson.objectid import ObjectId
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@bp.route('/<note_id>', methods=['PUT'])
def update_note(note_id):
    """Update a note"""
    try:
        if not hasattr(current_app, 'db'):
            return jsonify({'error': 'Database not initialized'}), 500
            
        note_data = request.get_json()
        
        if not note_data:
            return jsonify({'error': 'No data provided'}), 400

        try:
            # Verify valid ObjectId
            object_id = ObjectId(note_id)
        except Exception as e:
            return jsonify({'error': 'Invalid note ID format'}), 400

        # Get existing note to verify cabinet_id
        existing_note = current_app.db.notes.find_one({'_id': ObjectId(note_id)})
        
        if not existing_note:
            return jsonify({'error': 'Note not found'}), 404

        # Build update data carefully
        update_data = {}
        
        # Add title if present
        if 'title' in note_data:
            update_data['title'] = note_data['title']
            
        # Add order if present
        if 'order' in note_data:
            update_data['order'] = note_data['order']
            
        # Add type if present
        if 'type' in note_data:
            update_data['type'] = note_data['type']
            
        # Add isExpanded if present
        if 'isExpanded' in note_data:
            update_data['isExpanded'] = note_data['isExpanded']
            
        # Keep existing cabinet_id
        update_data['cabinet_id'] = existing_note['cabinet_id']

        # Handle content based on note type
        note_type = note_data.get('type', existing_note.get('type', 'standard'))
        if note_type == 'task':
            if 'tasks' in note_data:
                update_data['tasks'] = note_data['tasks']
        elif note_type == 'calendar':
            if 'viewType' in note_data:
                update_data['viewType'] = note_data['viewType']
            if 'calendarData' in note_data:
                update_data['calendarData'] = note_data['calendarData']
            if 'views' in note_data:
                update_data['views'] = note_data['views']
        else:
            if 'content' in note_data:
                update_data['content'] = sanitize_html(note_data['content'])
        
        # Perform the update
        result = current_app.db.notes.update_one(
            {'_id': ObjectId(note_id)},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Note not found'}), 404
        
        # Get the updated note
        updated_note = current_app.db.notes.find_one({'_id': ObjectId(note_id)})
        if updated_note:
            updated_note['_id'] = str(updated_note['_id'])
        
        return jsonify(updated_note)
        
    except Exception as e:
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