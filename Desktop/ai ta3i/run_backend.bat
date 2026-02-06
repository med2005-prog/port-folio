@echo off
title AI Backend Server
echo ===================================================
echo      Starting AI Backend (Python Server)
echo ===================================================

echo [1/2] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is NOT installed!
    echo         The buttons will NOT work without Python.
    echo.
    echo         Please run 'install_python.bat' first.
    echo.
    pause
    exit /b
)

echo [2/2] Starting Server...
cd backend
if not exist venv (
    echo [WARNING] Virtual environment missing. Creating...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

echoServer running on http://127.0.0.1:8000
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
