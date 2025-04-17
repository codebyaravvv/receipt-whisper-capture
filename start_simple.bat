
@echo off

REM Create uploads and training_data directories if they don't exist
mkdir backend\uploads 2>nul
mkdir backend\training_data 2>nul
mkdir backend\training_data\models 2>nul

REM Find Python command
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

REM Start Python backend
echo Starting Python backend server...
start cmd /k "cd backend && %PYTHON_CMD% server.py"

REM Wait a moment for the backend to initialize
timeout /t 5

REM Start the React app
echo Starting React frontend...
npx vite

echo Both backend and frontend are now running.
