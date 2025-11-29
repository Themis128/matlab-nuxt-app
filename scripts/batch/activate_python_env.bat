@echo off
REM Activate Python Virtual Environment
REM Quick script to activate the venv
REM Change to project root directory
cd /d "%~dp0\..\.."

if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run scripts\batch\setup_python_env.bat first
    pause
    exit /b 1
)

call venv\Scripts\activate.bat
echo Python virtual environment activated!
echo.
echo You can now use:
echo   python scripts\python\view_mat_file.py path/to/file.mat
echo.
cmd /k
