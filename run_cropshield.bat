@echo off
title CropShield AI - Smart Agricultural Platform
echo ============================================================
echo   CropShield AI - 1-Click Platform Launcher
echo   Detect Early. Protect Crops. Empower Farmers.
echo ============================================================
echo.

cd /d "%~dp0"

echo Checking Python environment...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found in system PATH.
    echo Please install Python 3.10+ and add it to PATH.
    pause
    exit /b 1
)

python run_app.py
pause
