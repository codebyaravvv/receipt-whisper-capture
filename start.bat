
@echo off

REM Create new terminal and start Python backend
start cmd /k "cd backend && pip install -r requirements.txt && python server.py"

REM Wait a moment for the backend to start
timeout /t 2

REM Start the React app
npm run dev
