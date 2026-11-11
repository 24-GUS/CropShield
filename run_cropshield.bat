@echo off
title CropShield AI - Smart Agricultural Platform
echo ============================================================
echo   CropShield AI - 1-Click Zero-Friction Platform Launcher
echo   Detect Early. Protect Crops. Empower Farmers.
echo ============================================================
echo.

cd /d "%~dp0"

:: 1. Verify Python availability
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3.10+ is required to run CropShield AI.
    echo Please install Python from https://www.python.org/downloads/
    echo (Make sure to check "Add Python to PATH" during installation)
    echo.
    pause
    exit /b 1
)

:: 2. Auto-verify and install dependencies if missing
echo [1/2] Verifying platform runtime dependencies...
python -c "import fastapi, uvicorn, sqlalchemy, PIL, cv2, joblib, sklearn" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] First-time setup detected. Automatically preparing dependencies...
    python -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [WARNING] Some dependencies had warnings. Continuing with startup...
    )
) else (
    echo [INFO] All core dependencies verified!
)

:: 3. Launch unified full-stack application (Frontend + Backend on port 8000)
echo.
echo [2/2] Launching CropShield AI Full-Stack Platform...
python entrypoint.py
pause
