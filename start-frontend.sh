#!/bin/bash

# PST Frontend-Only Startup
# Use this to start just the React frontend server

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python3 -m venv .venv"
    exit 1
fi

source .venv/bin/activate

# Kill existing process on 5173
lsof -ti:5173 > /dev/null 2>&1 && kill -9 $(lsof -ti:5173) 2>/dev/null

cd frontend

echo ""
echo "=========================================="
echo "🎯 Starting PST Frontend Server"
echo "=========================================="
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "📡 Backend:  http://localhost:8000 (must be running)"
echo ""
echo "⏹️  To stop, press Ctrl+C"
echo "=========================================="
echo ""

npm run dev
