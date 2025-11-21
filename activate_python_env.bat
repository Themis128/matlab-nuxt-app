@echo off
REM Activate Python Virtual Environment
REM Quick script to activate the venv

if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run setup_python_env.bat first
    pause
    exit /b 1
)

call venv\Scripts\activate.bat
echo Python virtual environment activated!
echo.
echo You can now use:
echo   python view_mat_file.py path/to/file.mat
echo.
cmd /k
