
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

REM Change to backend directory
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv\" (
  echo Creating Python virtual environment...
  %PYTHON_CMD% -m venv venv
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to create virtual environment. Please install venv using: pip install virtualenv
    pause
    exit /b 1
  )
)

REM Check Python version
%PYTHON_CMD% -c "import sys; print(f'Detected Python {sys.version_info.major}.{sys.version_info.minor}')"

REM Activate the virtual environment and install dependencies
echo Installing Python dependencies in virtual environment...
call venv\Scripts\activate

REM Upgrade pip first
pip install --upgrade pip

REM Install requirements
pip install -r requirements.txt

REM Try to install TensorFlow (might fail on some systems but that's okay)
pip install tensorflow || (
  echo Could not install tensorflow.
  echo This is okay - the OCR backend will use basic functionality.
  echo If you want full ML capabilities, please follow TensorFlow installation instructions manually.
)

REM Start the backend server in the current console
echo Starting Python backend server with improved error handling...
start cmd /k "cd backend && venv\Scripts\activate && python server.py"

REM Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak

REM Go back to root directory
cd ..

REM Install npm dependencies if not already installed
if not exist "node_modules\" (
  echo Installing npm dependencies...
  call npm install
)

REM Start the React app
echo Starting React frontend...
call npm run dev

echo Both backend and frontend are now running.
