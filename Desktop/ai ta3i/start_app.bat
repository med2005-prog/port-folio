@echo off
title AI Video Editor Launcher

echo ===================================================
echo      AI Video Motion Editor - Startup Script
echo ===================================================
echo.

:: --- 1. Check Node.js (Required for Frontend) ---
echo [1/3] Checking Node.js...
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed!
    echo         The website cannot run without it.
    echo         Please install from: https://nodejs.org/
    pause
    exit /b
)
echo [OK] Node.js found.

:: --- 2. Check Python (Required for Backend) ---
echo.
echo [2/3] Checking Python (for AI features)...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Python is NOT installed or not in PATH!
    echo           The Website will work, but AI features will fail.
    echo           Run 'install_python.bat' to fix this.
) else (
    echo [OK] Python found. Starting Backend Server...
    echo       Using virtual environment (venv)...
    start "AI Backend" cmd /k "cd backend && call venv\Scripts\activate && uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
)

:: --- 3. Start Frontend ---
echo.
echo [3/3] Starting Frontend Website...
echo       (First time may take 1-2 minutes to install dependencies)
echo       Note: Forcing IPv4 address (127.0.0.1) and Port 3005
start "AI Frontend (Do not close)" cmd /k "cd frontend && npm install && npm run dev -- -H 127.0.0.1 -p 3005"

:: --- 4. Open Browser ---
echo.
echo ===================================================
echo   App is starting!
echo   Opening http://127.0.0.1:3005 in 5 seconds...
echo ===================================================
timeout /t 5 >nul
start http://127.0.0.1:3005

echo.
echo The windows must stay open for the site to work.
echo You can minimize them.
pause
