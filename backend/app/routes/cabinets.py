from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId

bp = Blueprint('cabinets', __name__, url_prefix='/api/cabinets')

@bp.route('/', methods=['GET'])
def get_cabinets():
    """Get all cabinets"""
    cabinets = list(bp.app.db.cabinets.find())
    
    # Convert ObjectId to string for JSON serialization
    for cabinet in cabinets:
        cabinet['_id'] = str(cabinet['_id'])
    
    return jsonify(cabinets)

@bp.route('/', methods=['POST'])
def create_cabinet():
    """Create a new cabinet"""
    cabinet_data = request.json
    result = bp.app.db.cabinets.insert_one(cabinet_data)
    cabinet_data['_id'] = str(result.inserted_id)
    return jsonify(cabinet_data), 201