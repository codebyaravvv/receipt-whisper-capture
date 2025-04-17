
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

REM Find pip command (try pip3 first, then pip)
where pip3 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  set PIP_CMD=pip3
) else (
  where pip >nul 2>&1
  if %ERRORLEVEL% EQU 0 (
    set PIP_CMD=pip
  ) else (
    echo Error: pip not found. Please install pip.
    exit /b 1
  )
)

REM Create new terminal and start Python backend
echo Starting Python backend server...
echo Installing Python dependencies...
cd backend && %PIP_CMD% install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
  echo Failed to install Python dependencies. Please check your pip installation.
  pause
  exit /b 1
)
start cmd /k "cd backend && %PYTHON_CMD% server.py"

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
