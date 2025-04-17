
#!/bin/bash

# Create required directories
mkdir -p backend/uploads
mkdir -p backend/training_data
mkdir -p backend/training_data/models

# Determine the correct Python command
PYTHON_CMD=$(command -v python3 || command -v python)

if [ -z "$PYTHON_CMD" ]; then
    echo "Error: Python not found. Please install Python."
    exit 1
fi

# Check Python version
PY_VERSION=$($PYTHON_CMD -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "Detected Python version: $PY_VERSION"

# Go to backend directory
cd backend

# Create and activate virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    $PYTHON_CMD -m venv venv
    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment. Please install venv using: pip install virtualenv"
        exit 1
    fi
fi

# Check for correct activate script location based on OS and shell
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux"* ]]; then
    if [ -f "venv/bin/activate" ]; then
        ACTIVATE_SCRIPT="venv/bin/activate"
    else
        echo "Looking for activate script in alternative locations..."
        find venv -name activate
        echo "Please try activating with the path shown above, or reinstall the virtual environment."
        exit 1
    fi
else
    # For Git Bash on Windows
    ACTIVATE_SCRIPT="venv/Scripts/activate"
fi

echo "Activating virtual environment using: $ACTIVATE_SCRIPT"
source "$ACTIVATE_SCRIPT"

if [ $? -ne 0 ]; then
    echo "Failed to activate virtual environment. Try one of these commands manually:"
    echo "  source venv/bin/activate   # Linux/macOS"
    echo "  source venv/Scripts/activate   # Git Bash on Windows"
    exit 1
fi

# Upgrade pip first
pip install --upgrade pip

# Check if this is Apple Silicon Mac
if [[ "$OSTYPE" == "darwin"* ]] && [[ $(uname -m) == "arm64" ]]; then
    echo "Detected Apple Silicon Mac"
    
    # Install base dependencies first
    pip install numpy pillow scikit-learn matplotlib opencv-python flask flask-cors python-dotenv
    
    # Determine compatible TensorFlow version based on Python version
    if [[ "$PY_VERSION" == 3.1* ]]; then
        echo "Python 3.10+ detected - attempting to install compatible tensorflow..."
        pip install tensorflow-macos || {
            echo "Failed to install tensorflow-macos automatically."
            echo "Please install tensorflow manually after the server starts by running:"
            echo "  cd backend"
            echo "  source venv/bin/activate"
            echo "  pip install tensorflow-macos"
            echo ""
            echo "If that doesn't work, you may need to downgrade to Python 3.10 or use a different approach."
        }
    else
        # Try to install tensorflow-macos for older Python versions
        pip install tensorflow-macos || {
            echo "Note: Could not install tensorflow-macos. Some features may be limited."
            echo "You may need to install tensorflow-macos manually."
        }
    fi
else
    # For other platforms, install all requirements normally
    pip install -r requirements.txt
fi

echo "Starting server..."
python server.py &
BACKEND_PID=$!

# Deactivate virtual environment
deactivate

# Go back to the root directory
cd ..

# Wait a moment for the backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Start the React app
echo "Starting React frontend..."
npm run dev

# When the React app is terminated, also terminate the backend
echo "Shutting down backend server..."
kill $BACKEND_PID
