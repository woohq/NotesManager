# Location: tests/robot/libraries/MongoLibrary.py

from pymongo import MongoClient
from robot.api.deco import library, keyword

@library
class MongoLibrary:
    """Custom library for MongoDB operations in Robot Framework tests"""
    
    def __init__(self):
        self.client = None
        self.db = None
    
    @keyword
    def connect_to_mongodb(self, uri, database):
        """Connect to MongoDB instance"""
        self.client = MongoClient(uri)
        self.db = self.client[database]
        return self.db
    
    @keyword
    def clean_collections(self):
        """Clean all test collections"""
        if self.db:
            self.db.cabinets.delete_many({})
            self.db.notes.delete_many({})
    
    @keyword
    def disconnect_from_mongodb(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            self.client = None
            self.db = None