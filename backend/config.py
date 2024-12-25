import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class"""
    # MongoDB settings
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/notes_manager')
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    
    # CORS settings
    CORS_ORIGINS = ['http://localhost:3000']
    CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    CORS_ALLOW_HEADERS = ['Content-Type', 'Authorization']
    CORS_SUPPORTS_CREDENTIALS = True
    CORS_MAX_AGE = 3600  # Maximum cache age for preflight requests
    
    # Basic server settings
    DEBUG = True