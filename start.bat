
@echo off

REM Create uploads and training_data directories if they don't exist
mkdir backend\uploads 2>nul
mkdir backend\training_data 2>nul
mkdir backend\training_data\models 2>nul

REM Create new terminal and start Python backend
echo Starting Python backend server...
start cmd /k "cd backend && pip install -r requirements.txt && python server.py"

REM Wait a moment for the backend to start
timeout /t 5

REM Start the React app
echo Starting React frontend...
npm run dev

echo Both backend and frontend are now running.
