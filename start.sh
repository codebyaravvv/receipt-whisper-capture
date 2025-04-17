
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

# Install requirements in the virtual environment
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Failed to install Python dependencies. Please check your pip installation."
    exit 1
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
