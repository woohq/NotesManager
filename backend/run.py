# backend/run.py
import os
import sys
from app import create_app
from config import Config, TestConfig

# Use TestConfig if TEST_MODE environment variable is set
config_class = TestConfig if os.getenv('TEST_MODE') == 'true' else Config
app = create_app(config_class)

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        use_reloader=True
    )