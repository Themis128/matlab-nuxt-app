@echo off
REM Train models from project root
REM Change to project root directory
cd /d "%~dp0\..\.."

echo Training scikit-learn models...
echo This will take 5-10 minutes...
echo.
call venv\Scripts\activate.bat
cd python_api
python train_models_sklearn.py
