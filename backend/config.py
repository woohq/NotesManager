import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class"""
    # MongoDB settings
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/notes_manager')
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    
    # Basic server settings
    DEBUG = True
    
    # CORS settings simplified
    CORS_HEADERS = ['Content-Type', 'Authorization']