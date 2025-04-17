
#!/bin/bash

# Start the Python backend
echo "Starting Python backend..."
cd backend
pip install -r requirements.txt
python server.py &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 2

# Go back to the root directory
cd ..

# Start the React app
echo "Starting React frontend..."
npm run dev

# When the React app is terminated, also terminate the backend
kill $BACKEND_PID
