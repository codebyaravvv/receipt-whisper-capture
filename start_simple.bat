
@echo off

REM Create required directories
mkdir backend\uploads 2>nul
mkdir backend\training_data 2>nul
mkdir backend\training_data\models 2>nul

REM Find Python command
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  set PYTHON_CMD=python
) else (
  echo Error: Python not found. Please install Python.
  exit /b 1
)

REM Install npm dependencies if not already installed
if not exist "node_modules\" (
  echo Installing npm dependencies...
  call npm install
)

REM Start backend in a new window
echo Starting backend server...
start cmd /k "cd backend && %PYTHON_CMD% -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && %PYTHON_CMD% server.py"

REM Wait a moment for the backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak

REM Start the React frontend
echo Starting React frontend with npx...
call npx vite

echo Application shutdown. Backend may still be running in another window.
