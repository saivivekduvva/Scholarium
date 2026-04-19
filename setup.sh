#!/bin/bash
echo "Setting up Scholarium..."
python3 -m venv venv
source venv/bin/activate
echo "Upgrading pip..."
pip install --upgrade pip
echo "Installing backend dependencies..."
pip install -r requirements.txt
echo "Scholarium setup complete. Activate venv: source venv/bin/activate"
