
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
    echo "Creating Python virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

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

# Start the React frontend
echo "Starting React frontend..."
echo "Running: npx vite"
npx vite

# When the frontend process ends, kill the backend
echo "Shutting down backend server..."
kill $BACKEND_PID 2>/dev/null || echo "Backend already stopped"
