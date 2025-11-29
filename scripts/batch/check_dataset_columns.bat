@echo off
echo ================================================================================
echo Checking Dataset Columns
echo ================================================================================
echo.

REM Change to project root directory
cd /d "%~dp0\..\.."

if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo Virtual environment activated
    echo.
)

python scripts\python\check_dataset_columns.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================================
    echo Analysis complete! Check the output above and data\dataset_analysis_results.json
    echo ================================================================================
) else (
    echo.
    echo ================================================================================
    echo Error occurred. Please check the error messages above.
    echo ================================================================================
)

pause
