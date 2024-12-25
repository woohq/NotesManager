from flask import Blueprint, request, jsonify, current_app, make_response
from bson.objectid import ObjectId
from datetime import datetime
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

bp = Blueprint('cabinets', __name__, url_prefix='/api/cabinets')

@bp.route('', methods=['OPTIONS'])
def handle_options():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add("Access-Control-Max-Age", "3600")
    return response

@bp.route('', methods=['GET'])
def get_cabinets():
    """Get all cabinets"""
    logger.debug("GET /api/cabinets endpoint called")
    try:
        cabinets = list(current_app.db.cabinets.find().sort('created_at', -1))
        
        # Convert ObjectId to string for JSON serialization
        for cabinet in cabinets:
            cabinet['_id'] = str(cabinet['_id'])
        
        return jsonify(cabinets)
    except Exception as e:
        logger.error(f"Error fetching cabinets: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('', methods=['POST'])
def create_cabinet():
    """Create a new cabinet"""
    logger.debug("POST /api/cabinets endpoint called")
    try:
        cabinet_data = request.json
        
        if not cabinet_data or 'name' not in cabinet_data:
            logger.error("Cabinet name is required")
            return jsonify({'error': 'Cabinet name is required'}), 400
            
        # Add timestamps
        now = datetime.utcnow()
        cabinet_data['created_at'] = now
        cabinet_data['updated_at'] = now
        
        # Check for duplicate names
        existing = current_app.db.cabinets.find_one({'name': cabinet_data['name']})
        if existing:
            logger.error("Cabinet name already exists")
            return jsonify({'error': 'A cabinet with this name already exists'}), 409
            
        result = current_app.db.cabinets.insert_one(cabinet_data)
        
        # Get the created cabinet
        new_cabinet = current_app.db.cabinets.find_one({'_id': result.inserted_id})
        new_cabinet['_id'] = str(new_cabinet['_id'])
        logger.debug(f"Created new cabinet: {new_cabinet}")
        
        return jsonify(new_cabinet), 201
    except Exception as e:
        logger.error(f"Error creating cabinet: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<cabinet_id>', methods=['GET'])
def get_cabinet(cabinet_id):
    """Get a specific cabinet"""
    logger.debug(f"GET /api/cabinets/{cabinet_id} endpoint called")
    try:
        cabinet = current_app.db.cabinets.find_one({'_id': ObjectId(cabinet_id)})
        
        if not cabinet:
            logger.error(f"Cabinet not found: {cabinet_id}")
            return jsonify({'error': 'Cabinet not found'}), 404
            
        cabinet['_id'] = str(cabinet['_id'])
        return jsonify(cabinet)
    except Exception as e:
        logger.error(f"Error fetching cabinet: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<cabinet_id>', methods=['PUT'])
def update_cabinet(cabinet_id):
    """Update a cabinet"""
    logger.debug(f"PUT /api/cabinets/{cabinet_id} endpoint called")
    try:
        cabinet_data = request.json
        
        if not cabinet_data or 'name' not in cabinet_data:
            logger.error("Cabinet name is required")
            return jsonify({'error': 'Cabinet name is required'}), 400
            
        # Check for duplicate names excluding current cabinet
        existing = current_app.db.cabinets.find_one({
            '_id': {'$ne': ObjectId(cabinet_id)},
            'name': cabinet_data['name']
        })
        if existing:
            logger.error("Cabinet name already exists")
            return jsonify({'error': 'A cabinet with this name already exists'}), 409
            
        # Update timestamp
        cabinet_data['updated_at'] = datetime.utcnow()
        
        result = current_app.db.cabinets.update_one(
            {'_id': ObjectId(cabinet_id)},
            {'$set': cabinet_data}
        )
        
        if result.matched_count == 0:
            logger.error(f"Cabinet not found: {cabinet_id}")
            return jsonify({'error': 'Cabinet not found'}), 404
            
        # Get updated cabinet
        updated_cabinet = current_app.db.cabinets.find_one({'_id': ObjectId(cabinet_id)})
        updated_cabinet['_id'] = str(updated_cabinet['_id'])
        logger.debug(f"Updated cabinet: {updated_cabinet}")
        
        return jsonify(updated_cabinet)
    except Exception as e:
        logger.error(f"Error updating cabinet: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<cabinet_id>', methods=['DELETE'])
def delete_cabinet(cabinet_id):
    """Delete a cabinet and optionally its notes"""
    logger.debug(f"DELETE /api/cabinets/{cabinet_id} endpoint called")
    try:
        # Check if cabinet exists
        cabinet = current_app.db.cabinets.find_one({'_id': ObjectId(cabinet_id)})
        if not cabinet:
            logger.error(f"Cabinet not found: {cabinet_id}")
            return jsonify({'error': 'Cabinet not found'}), 404
            
        # Delete all notes in the cabinet
        current_app.db.notes.delete_many({'cabinet_id': cabinet_id})
        
        # Delete the cabinet
        result = current_app.db.cabinets.delete_one({'_id': ObjectId(cabinet_id)})
        
        if result.deleted_count == 0:
            logger.error(f"Cabinet not found: {cabinet_id}")
            return jsonify({'error': 'Cabinet not found'}), 404
        
        logger.debug(f"Deleted cabinet and associated notes: {cabinet_id}")    
        return jsonify({'message': 'Cabinet and associated notes deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting cabinet: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/<cabinet_id>/notes', methods=['GET'])
def get_cabinet_notes(cabinet_id):
    """Get all notes in a cabinet"""
    logger.debug(f"GET /api/cabinets/{cabinet_id}/notes endpoint called")
    try:
        # Verify cabinet exists
        cabinet = current_app.db.cabinets.find_one({'_id': ObjectId(cabinet_id)})
        if not cabinet:
            logger.error(f"Cabinet not found: {cabinet_id}")
            return jsonify({'error': 'Cabinet not found'}), 404
            
        notes = list(current_app.db.notes.find(
            {'cabinet_id': cabinet_id}
        ).sort('order', 1))
        
        # Convert ObjectId to string for JSON serialization
        for note in notes:
            note['_id'] = str(note['_id'])
            
        return jsonify(notes)
    except Exception as e:
        logger.error(f"Error fetching cabinet notes: {str(e)}")
        return jsonify({'error': str(e)}), 500