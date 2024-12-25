# backend/run.py
import os
import sys
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',  # Listen on all available interfaces
        port=5001,  # Changed from 5000 to 5001
        debug=True,
        use_reloader=True
    )