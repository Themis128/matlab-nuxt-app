@echo off
REM Batch script to populate Greek market prices for all models

echo ========================================
echo Greek Market Price Populator
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
echo This will populate Current Price (Greece) column for all models
echo using EUR prices with Greek market adjustment factor (5%% markup).
echo.

if "%1"=="" (
    echo Starting for all models...
    python scripts\python\populate_greek_prices.py
) else (
    echo Starting with limit: %1 models...
    python scripts\python\populate_greek_prices.py --limit %1
)

echo.
echo ========================================
echo Done!
echo ========================================
pause
