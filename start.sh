
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

# Install main requirements
pip install -r requirements.txt

# Check for platform-specific dependencies and attempt installation
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Detected macOS"
    if [[ $(uname -m) == "arm64" ]]; then
        echo "Detected Apple Silicon (arm64)"
        # Try to install TensorFlow for Apple Silicon
        pip install tensorflow-macos || {
            echo "Could not install tensorflow-macos."
            echo "This is okay - the OCR backend will use basic functionality."
            echo "If you want full ML capabilities, please follow installation instructions manually."
        }
    else
        echo "Detected Intel Mac"
        # Try to install regular TensorFlow
        pip install tensorflow || {
            echo "Could not install tensorflow."
            echo "This is okay - the OCR backend will use basic functionality."
        }
    fi
elif [[ "$OSTYPE" == "linux"* ]]; then
    echo "Detected Linux"
    # Try to install regular TensorFlow
    pip install tensorflow || {
        echo "Could not install tensorflow."
        echo "This is okay - the OCR backend will use basic functionality."
    }
fi

echo "Starting server with improved error handling..."
python server.py > server.log 2>&1 &
BACKEND_PID=$!

# Wait to verify the server started successfully
echo "Waiting for backend to initialize..."
sleep 2

# Check if process is still running
if ! ps -p $BACKEND_PID > /dev/null; then
    echo "ERROR: Backend failed to start. Check server.log for details."
    cat server.log
    exit 1
fi

# Save PID to file for later cleanup
echo $BACKEND_PID > backend_pid.txt

# Deactivate virtual environment
deactivate

# Go back to the root directory
cd ..

# Wait a moment for the backend to initialize
echo "Waiting for backend to fully initialize..."
sleep 5

# Start the React app
echo "Starting React frontend..."
npm run dev

# When the React app is terminated, also terminate the backend
echo "Shutting down backend server..."
if [ -f "backend/backend_pid.txt" ]; then
    BACKEND_PID=$(cat backend/backend_pid.txt)
    kill $BACKEND_PID 2>/dev/null || echo "Backend already stopped"
    rm backend/backend_pid.txt
fi

echo "Application shutdown complete."
