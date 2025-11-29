@echo off
REM Euro Price Scraper - Windows Batch File
REM Change to project root directory
cd /d "%~dp0\..\.."

echo ========================================
echo Euro Price Scraper for Mobile Phones
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo [OK] Python found
echo.

REM Check if required packages are installed
echo [→] Checking dependencies...
python -c "import pandas, requests, bs4" >nul 2>&1
if errorlevel 1 (
    echo [!] Missing dependencies. Installing...
    pip install pandas requests beautifulsoup4
    if errorlevel 1 (
        echo [X] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo [OK] All dependencies found
)

echo.
echo ========================================
echo Starting Euro Price Scraper
echo ========================================
echo.
echo Options:
echo   - First 10 models: python scripts\python\scrape_euro_prices.py --limit 10
echo   - All models: python scripts\python\scrape_euro_prices.py
echo   - Keep USD prices: python scripts\python\scrape_euro_prices.py --keep-usd
echo.

REM Check if limit argument is provided
if "%1"=="" (
    echo [→] No limit specified. Running for first 10 models as test...
    echo [→] Use: scripts\batch\scrape_euro_prices.bat 50  (for 50 models)
    echo [→] Use: scripts\batch\scrape_euro_prices.bat all (for all models)
    echo.
    python scripts\python\scrape_euro_prices.py --limit 10
) else if "%1"=="all" (
    echo [→] Running for ALL models (this will take a very long time!)
    echo [→] Press Ctrl+C to stop at any time
    echo.
    timeout /t 5 /nobreak >nul
    python scripts\python\scrape_euro_prices.py
) else (
    echo [→] Running for first %1 models...
    python scripts\python\scrape_euro_prices.py --limit %1
)

echo.
echo ========================================
echo Scraping Complete!
echo ========================================
echo.
echo Updated dataset: mobiles-dataset-docs\Mobiles Dataset (2025)_EUR.csv
echo Progress saved to: data\euro_price_scraping_progress.json
echo.
pause
