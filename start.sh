
#!/bin/bash

# Create required directories
mkdir -p backend/uploads
mkdir -p backend/training_data
mkdir -p backend/training_data/models

# Start the Python backend
echo "Starting Python backend server..."
cd backend
pip install -r requirements.txt
python server.py &
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
