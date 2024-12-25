# backend/app/utils/cors_config.py
from flask_cors import CORS
from functools import wraps
from flask import request, current_app

def configure_cors(app):
    """Configure CORS with specific settings for Chrome compatibility"""
    CORS(app, 
         resources={
             r"/api/*": {
                 "origins": ["http://localhost:3000"],
                 "methods": ["GET", "HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
                 "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
                 "expose_headers": ["Content-Type", "X-Total-Count"],
                 "supports_credentials": True,
                 "send_wildcard": False,
                 "max_age": 86400
             }
         })

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = current_app.make_default_options_response()
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
            response.headers.add('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS,PUT,PATCH,DELETE')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            response.headers.add('Access-Control-Max-Age', '86400')
            return response

    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin and origin == 'http://localhost:3000':
            response.headers.add('Access-Control-Allow-Origin', origin)
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
            response.headers.add('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS,PUT,PATCH,DELETE')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            response.headers.add('Access-Control-Max-Age', '86400')
            response.headers.add('Access-Control-Expose-Headers', 'Content-Type,X-Total-Count')
            # Prevent caching of responses
            response.headers.add('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0')
            response.headers.add('Pragma', 'no-cache')
        return response

    return app