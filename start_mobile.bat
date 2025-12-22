@echo off
echo ============================================
echo   FixMyCondo Mobile/Web - Quick Start
echo   Web App: Port 9031
echo ============================================
echo.

REM Check if we're in the right directory
if not exist "mobile" (
    echo Error: Please run this script from the Condo project root directory
    pause
    exit /b 1
)

cd mobile

echo [1/2] Installing npm dependencies...
call npm install

echo.
echo [2/2] Starting Expo development server on PORT 9031...
echo.
echo ============================================
echo   App Starting!
echo ============================================
echo.
echo Mobile: Scan QR code with Expo Go app
echo Web:    http://localhost:9031
echo.

call npx expo start --web --port 9031
