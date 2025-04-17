
@echo off

REM Create required directories
mkdir backend\uploads 2>nul
mkdir backend\training_data 2>nul
mkdir backend\training_data\models 2>nul

REM Use specific Python interpreter (change this path to your actual Python 3.12 path on Windows)
set PYTHON_CMD=python3.12
echo Using Python interpreter: %PYTHON_CMD%

REM Check if interpreter exists
where %PYTHON_CMD% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Python 3.12 not found with command '%PYTHON_CMD%'
  echo Falling back to 'python' command...
  set PYTHON_CMD=python
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

REM Start the React frontend with node_modules/.bin in PATH
echo Starting React frontend with npx...
set PATH=%PATH%;.\node_modules\.bin
call npx vite

echo Application shutdown. Backend may still be running in another window.
