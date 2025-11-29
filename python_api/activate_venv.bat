@echo off
REM Activate virtual environment for Windows
call ..\venv\Scripts\activate.bat
echo Virtual environment activated!
echo Python:
python --version
echo.
echo To train models: python train_models_sklearn.py
echo To start API: python api.py
