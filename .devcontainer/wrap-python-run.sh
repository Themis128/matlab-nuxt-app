#!/bin/bash
set -e

echo "Starting API wrapper..."
WORKDIR=/workspace
cd $WORKDIR/python_api

VENV_DIR=/workspace/.venv
if [ ! -d "$VENV_DIR" ]; then
  echo "Creating Python virtualenv at $VENV_DIR"
  python -m venv $VENV_DIR
  $VENV_DIR/bin/pip install --upgrade pip setuptools wheel
  if [ -f "requirements.txt" ]; then
    echo "Installing API requirements"
    $VENV_DIR/bin/pip install -r requirements.txt || true
  fi
fi

export PATH="$VENV_DIR/bin:$PATH"
echo "Starting Python API"
python api.py
