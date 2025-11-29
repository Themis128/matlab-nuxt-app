@echo off
REM Start Python API from project root
REM Change to project root directory
cd /d "%~dp0\..\.."

echo Starting Python API...
call venv\Scripts\activate.bat
cd python_api
python api.py
