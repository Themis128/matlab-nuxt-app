@echo off
REM Mobile Phone Image Scraper - Windows Batch File
REM Change to project root directory
cd /d "%~dp0\..\.."

echo ========================================
echo Mobile Phone Image Scraper
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
echo Starting Image Scraper
echo ========================================
echo.
echo Options:
echo   - First 10 models: scripts\batch\scrape_images.bat 10
echo   - All models: scripts\batch\scrape_images.bat all
echo   - Missing only: scripts\batch\scrape_images.bat missing
echo   - Resume from index: python scripts\python\scrape_mobile_images.py --start-from 50
echo.

REM Check if limit argument is provided
if "%1"=="" (
    echo [→] No option specified. Running for first 10 models as test...
    echo [→] Use: scripts\batch\scrape_images.bat 50  (for 50 models)
    echo [→] Use: scripts\batch\scrape_images.bat all (for all models)
    echo [→] Use: scripts\batch\scrape_images.bat missing (for missing images only)
    echo.
    python scripts\python\scrape_mobile_images.py --limit 10
) else if "%1"=="all" (
    echo [→] Running for ALL models (this will take a long time!)
    echo [→] Press Ctrl+C to stop at any time
    echo.
    timeout /t 5 /nobreak >nul
    python scripts\python\scrape_mobile_images.py
) else if "%1"=="missing" (
    echo [→] Running for MISSING images only...
    echo [→] This will only scrape models with 0 images or fewer than 3 images
    echo.
    python scripts\python\scrape_mobile_images.py --missing-only
) else (
    echo [→] Running for first %1 models...
    python scripts\python\scrape_mobile_images.py --limit %1
)

echo.
echo ========================================
echo Scraping Complete!
echo ========================================
echo.
echo Images saved to: public\mobile_images\
echo Progress saved to: public\mobile_images\scraping_progress.json
echo Updated dataset: dataset_with_images.csv
echo.
pause
