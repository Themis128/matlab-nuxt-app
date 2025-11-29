@echo off
REM Batch script to scrape Greek market prices for mobile phones

echo ========================================
echo Greek Market Price Scraper
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
echo This will scrape current prices from Greek e-commerce sites.
echo It may take a while depending on the number of models.
echo.
echo Options:
echo   - Test with 10 models: scrape_greek_prices.bat 10
echo   - Run for all models: scrape_greek_prices.bat all
echo.

if "%1"=="" (
    echo Starting with default limit (10 models for testing)...
    python scripts\python\scrape_greek_prices.py --limit 10
) else if "%1"=="all" (
    echo Starting full scrape for all models...
    python scripts\python\scrape_greek_prices.py
) else (
    echo Starting with limit: %1 models...
    python scripts\python\scrape_greek_prices.py --limit %1
)

echo.
echo ========================================
echo Done!
echo ========================================
pause
