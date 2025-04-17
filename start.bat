
@echo off

REM Create uploads and training_data directories if they don't exist
mkdir backend\uploads 2>nul
mkdir backend\training_data 2>nul
mkdir backend\training_data\models 2>nul

REM Find Python command (try python3 first, then python)
where python3 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  set PYTHON_CMD=python3
) else (
  where python >nul 2>&1
  if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=python
  ) else (
    echo Error: Python not found. Please install Python.
    exit /b 1
  )
)

REM Create virtual environment if it doesn't exist
if not exist "backend\venv\" (
  echo Creating Python virtual environment...
  %PYTHON_CMD% -m venv backend\venv
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to create virtual environment. Please install venv using: pip install virtualenv
    pause
    exit /b 1
  )
)

REM Create new terminal and start Python backend with virtual environment
echo Starting Python backend server...
echo Installing Python dependencies in virtual environment...

REM Start a new command window that activates the venv, installs requirements, and starts the server
start cmd /k "cd backend && venv\Scripts\activate && pip install -r requirements.txt && python server.py"

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
