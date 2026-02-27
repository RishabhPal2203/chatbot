#!/bin/bash

echo "🚀 Starting Cloud Contact Center AI..."

# Check if running in Docker
if [ -f "/.dockerenv" ]; then
    echo "Running in Docker container"
    exit 0
fi

# Start backend
echo "Starting backend server..."
cd "$(dirname "$0")"
python3 backend/main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Application started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
