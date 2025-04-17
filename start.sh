
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

# Create and activate virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    $PYTHON_CMD -m venv backend/venv
    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment. Please install venv using: pip install virtualenv"
        exit 1
    fi
fi

# Activate virtual environment and install dependencies
echo "Starting Python backend server..."
cd backend
echo "Installing Python dependencies in virtual environment..."
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux"* ]]; then
    source venv/bin/activate
else
    # For Git Bash on Windows
    source venv/Scripts/activate
fi

# Upgrade pip first
pip install --upgrade pip

# Check if this is Apple Silicon Mac
if [[ "$OSTYPE" == "darwin"* ]] && [[ $(uname -m) == "arm64" ]]; then
    echo "Detected Apple Silicon Mac - installing tensorflow-macos"
    # Install base dependencies except TensorFlow first
    pip install numpy pillow scikit-learn matplotlib opencv-python flask flask-cors python-dotenv
    # Then try to install tensorflow-macos
    pip install tensorflow-macos>=2.7.0
    if [ $? -ne 0 ]; then
        echo "Note: Could not install tensorflow-macos. Some features may be limited."
        echo "You may need to install tensorflow-macos manually."
    fi
else
    # For other platforms, install all requirements normally
    pip install -r requirements.txt
fi

if [ $? -ne 0 ]; then
    echo "There were some issues with Python dependencies."
    echo "The app may still work with limited functionality."
fi

echo "Starting server..."
python server.py &
BACKEND_PID=$!

# Deactivate virtual environment
deactivate

# Wait a moment for the backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Go back to the root directory
cd ..

# Start the React app
echo "Starting React frontend..."
npm run dev

# When the React app is terminated, also terminate the backend
echo "Shutting down backend server..."
kill $BACKEND_PID
