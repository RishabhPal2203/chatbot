#!/bin/bash

echo "=========================================="
echo "Cloud Contact Center AI - Setup Script"
echo "=========================================="

# Check Python version
echo "Checking Python version..."
python3 --version

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Download spaCy model
echo "Downloading spaCy language model..."
python -m spacy download en_core_web_sm

# Create necessary directories
echo "Creating directories..."
mkdir -p audio_responses

# Setup frontend
echo "Setting up frontend..."
cd frontend
npm install
cd ..

echo "=========================================="
echo "Setup completed successfully!"
echo "=========================================="
echo ""
echo "To start the application:"
echo "1. Backend: python backend/main.py"
echo "2. Frontend: cd frontend && npm start"
echo ""
echo "Or use Docker: docker-compose up"
