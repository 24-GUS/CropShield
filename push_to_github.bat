@echo off
title CropShield AI - Push to GitHub
cd /d "%~dp0"
echo ============================================================
echo   CropShield AI - Pushing to GitHub Repository
echo   Target: https://github.com/vishweshu/cropshield-ai.git
echo ============================================================
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Code pushed successfully to GitHub!
    echo View repository at: https://github.com/vishweshu/cropshield-ai
) else (
    echo.
    echo [NOTE] If repository was not created yet:
    echo 1. Go to https://github.com/new
    echo 2. Name it "cropshield-ai"
    echo 3. Click "Create repository" (leave README/gitignore unchecked)
    echo 4. Run this script again!
)
echo.
pause
