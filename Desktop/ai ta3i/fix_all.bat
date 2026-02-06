@echo off
title AI Project Fixer - al-mosli7
echo ===================================================
echo      AI Project - 2adawat al-isla7 (Fix/Clean Tool)
echo ===================================================
echo.
echo [1/3] Jar'i 7adf al-milaffat al-qadima...
echo       (Cleaning old files...)

cd frontend
if exist node_modules (
    echo       - Deleting node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo       - Deleting package-lock.json...
    del package-lock.json
)
if exist .next (
    echo       - Deleting .next cache...
    rmdir /s /q .next
)
cd ..

echo.
echo [2/3] I3adat tathbit al-maktabat (Re-installing)...
echo       Haada sayaghriq ba3d al-waqt (3-5 min)...
echo       (Installing dependencies...)

cd frontend
call npm install
cd ..

echo.
echo [3/3] Tahyi'at al-Backend...
cd backend
if not exist venv (
    echo       - Python 'venv' not found. Creating...
    python -m venv venv
)
echo       - Installing backend requirements...
call venv\Scripts\activate
pip install -r requirements.txt
python main.py --help >nul 2>&1
if %errorlevel% neq 0 (
   echo       [WARNING] Backend dependencies might have failed.
)
deactivate
cd ..

echo.
echo ===================================================
echo   Tam al-isla7 binajah! (Fix Complete)
echo   Al-an, yumkinuka tachghil 'start_app.bat'
echo ===================================================
pause
