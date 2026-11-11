@echo off
title CropShield AI - Environment Setup
echo ============================================================
echo   CropShield AI - Automated Setup
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Installing Python Backend dependencies...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [WARNING] Some Python packages could not be installed. Check terminal above.
)

echo.
echo [2/3] Installing Frontend Node dependencies...
cd frontend
call npm install
cd ..

echo.
echo [3/3] Verifying and seeding agricultural database...
cd backend
python -c "from app.database.seed_data import seed_database; seed_database(); print('Database verified successfully!')"
cd ..

echo.
echo ============================================================
echo   Setup Complete! Double-click 'run_cropshield.bat' to start!
echo ============================================================
pause
