
#!/bin/bash

# Create required directories
mkdir -p backend/uploads
mkdir -p backend/training_data
mkdir -p backend/training_data/models

# Use Python 3.12.10 specifically
PYTHON_CMD="/opt/homebrew/bin/python3.12"
echo "Using Python interpreter: $PYTHON_CMD"

# Check Python version
PY_VERSION=$($PYTHON_CMD -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "Python version: $PY_VERSION"

# Install npm dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Check if npx is installed
if ! command -v npx &> /dev/null; then
    echo "Error: npx not found. Please make sure npm is installed correctly."
    echo "Try running 'npm install -g npm' to update npm."
    exit 1
fi

# Start backend in the background
echo "Starting backend server..."
cd backend

# Check if venv exists, if not create it
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment with Python 3.12.10..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Install requirements
echo "Installing Python requirements..."
pip install -r requirements.txt

# Start the server
python server.py > server.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for the backend to initialize
echo "Waiting for backend to initialize..."
sleep 5

# Start the React frontend with explicit npx path
echo "Starting React frontend..."
PATH="$PATH:./node_modules/.bin" npx vite

# When the frontend process ends, kill the backend
echo "Shutting down backend server..."
kill $BACKEND_PID 2>/dev/null || echo "Backend already stopped"
