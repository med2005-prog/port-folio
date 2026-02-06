@echo off
title AI Website DEBUG
echo ===================================================
echo      DEBUG MODE - AI Website
echo ===================================================

cd frontend
echo Running 'npm run start'...
call npm run start -- -p 3005

echo.
echo ===================================================
echo   IF THE SITE DID NOT OPEN, READ THE ERROR ABOVE
echo ===================================================
pause
