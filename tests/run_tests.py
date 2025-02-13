# Location: tests/run_tests.py

import os
import sys
import subprocess
from webdrivermanager import ChromeDriverManager

def setup_webdriver():
    """Install/update chromedriver"""
    chrome_manager = ChromeDriverManager()
    chrome_manager.download_and_install()

def run_robot_tests():
    """Run Robot Framework tests"""
    # Get the directory containing this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct paths
    robot_dir = os.path.join(current_dir, 'robot')
    output_dir = os.path.join(current_dir, 'results')
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Build the robot command
    robot_command = [
        'robot',
        '--outputdir', output_dir,
        '--loglevel', 'DEBUG',
        robot_dir
    ]
    
    # Run the tests
    result = subprocess.run(robot_command)
    return result.returncode

if __name__ == '__main__':
    print("Setting up WebDriver...")
    setup_webdriver()
    
    print("Running Robot Framework tests...")
    sys_exit_code = run_robot_tests()
    
    sys.exit(sys_exit_code)