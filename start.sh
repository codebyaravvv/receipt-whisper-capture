
#!/bin/bash

# Create required directories
mkdir -p backend/uploads
mkdir -p backend/training_data
mkdir -p backend/training_data/models

# Start the Python backend
echo "Starting Python backend server..."
cd backend
pip install -r requirements.txt
python3 server.py &
BACKEND_PID=$!

# Wait a moment for the backend to initialize
echo "Waiting for backend to initialize..."
sleep 5

# Go back to the root directory
cd ..

# Install npm dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

# Start the React app
echo "Starting React frontend..."
npm run dev

# When the React app is terminated, also terminate the backend
echo "Shutting down backend server..."
kill $BACKEND_PID
