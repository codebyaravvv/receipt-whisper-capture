
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

# Determine the correct pip command
PIP_CMD=$(command -v pip3 || command -v pip)

if [ -z "$PIP_CMD" ]; then
    echo "Error: pip not found. Please install pip."
    exit 1
fi

# Start the Python backend
echo "Starting Python backend server..."
cd backend
echo "Installing Python dependencies..."
$PIP_CMD install -r requirements.txt
echo "Starting server..."
$PYTHON_CMD server.py &
BACKEND_PID=$!

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
