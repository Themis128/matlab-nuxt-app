#!/bin/bash
# Activate Python Virtual Environment
# Quick script to activate the venv

if [ ! -d "venv" ]; then
    echo "ERROR: Virtual environment not found!"
    echo "Please run setup_python_env.sh first"
    exit 1
fi

source venv/bin/activate
echo "Python virtual environment activated!"
echo ""
echo "You can now use:"
echo "  python view_mat_file.py path/to/file.mat"
echo ""

# Keep shell open
exec $SHELL
