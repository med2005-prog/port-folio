@echo off
title AI Website Only
echo ===================================================
echo      Starting AI Website (Frontend Only)
echo      (Note: AI features will not work without Python)
echo ===================================================

cd frontend

echo [1/2] Starting Server (Port 3005)...
echo       A new window will open for the server. DO NOT CLO:: Start in background (DEV MODE for live updates)
start "AI SERVER (Do not close)" cmd /k "npm run dev -- -p 3005 -H 127.0.0.1"

echo.
echo [2/2] Opening Browser...
timeout /t 5 >nul
start http://127.0.0.1:3005

echo.
echo Website should be open now.
echo Do NOT close this window.
pause
