@echo off
REM Test Python API from project root
REM Change to project root directory
cd /d "%~dp0\..\.."

echo Testing Python API...
call venv\Scripts\activate.bat
cd python_api
python test_api.py
