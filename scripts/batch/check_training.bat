@echo off
echo ================================================================================
echo Checking Training Status
echo ================================================================================
echo.

REM Change to project root directory
cd /d "%~dp0\..\.."

if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo Virtual environment activated
    echo.
)

cd python_api

python check_training_status.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================================
    echo Training status check complete!
    echo ================================================================================
) else (
    echo.
    echo ================================================================================
    echo Error occurred. Please check the error messages above.
    echo ================================================================================
)

pause
