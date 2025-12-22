@echo off
echo ============================================
echo   FixMyCondo - Quick Start Script
echo   Backend: Port 9030
echo ============================================
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo Error: Please run this script from the Condo project root directory
    pause
    exit /b 1
)

echo [1/4] Setting up Python virtual environment...
cd backend
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate

echo.
echo [2/4] Installing Python dependencies...
pip install -r requirements.txt -q

echo.
echo [3/4] Creating .env file if not exists...
if not exist ".env" (
    copy .env.example .env
    echo Created .env file from template
) else (
    echo .env file already exists
)

echo.
echo [4/4] Seeding database with test data...
python seed_data.py

echo.
echo ============================================
echo   Backend Ready!
echo ============================================
echo.
echo Starting FastAPI server on PORT 9030...
echo API will be available at: http://localhost:9030
echo Swagger docs at: http://localhost:9030/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 9030
