#!/bin/bash
# Activate virtual environment for Linux/Mac
source ../venv/bin/activate
echo "Virtual environment activated!"
echo "Python: $(python --version)"
echo ""
echo "To train models: python train_models_sklearn.py"
echo "To start API: python api.py"
