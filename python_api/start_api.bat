@echo off
REM Start Python API Server
echo Starting Python API Server...
echo.

REM Activate virtual environment
call ..\venv\Scripts\activate.bat

REM Change to python_api directory
cd /d "%~dp0"

REM Start API
echo Starting FastAPI server on http://localhost:8000
echo Press Ctrl+C to stop
echo.
python api.py
