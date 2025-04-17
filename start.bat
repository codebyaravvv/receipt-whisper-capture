
@echo off

REM Create uploads and training_data directories if they don't exist
mkdir backend\uploads 2>nul
mkdir backend\training_data 2>nul
mkdir backend\training_data\models 2>nul

REM Create new terminal and start Python backend
echo Starting Python backend server...
start cmd /k "cd backend && pip install -r requirements.txt && python server.py"

REM Wait a moment for the backend to initialize
timeout /t 5

REM Install npm dependencies if not already installed
if not exist "node_modules\" (
  echo Installing npm dependencies...
  call npm install
)

REM Start the React app
echo Starting React frontend...
call npm run dev

echo Both backend and frontend are now running.
