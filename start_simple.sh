
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

# Start backend in the background
echo "Starting backend server..."
cd backend
$PYTHON_CMD server.py &
BACKEND_PID=$!
cd ..

# Wait a moment for the backend to initialize
echo "Waiting for backend to initialize..."
sleep 5

# Start the React frontend
echo "Starting React frontend..."
npx vite

# When the frontend process ends, kill the backend
echo "Shutting down backend server..."
kill $BACKEND_PID
