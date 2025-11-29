@echo off
REM Batch script to populate EUR prices for all models in the dataset

echo ========================================
echo EUR Price Populator
echo ========================================
echo.

cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python is not installed or not in PATH
    echo     Please install Python 3.7+ and try again
    pause
    exit /b 1
)

echo [OK] Python found
echo.

REM Run the EUR price populator
python scripts\python\populate_eur_prices.py

echo.
echo ========================================
echo Done!
echo ========================================
pause

