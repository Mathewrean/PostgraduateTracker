#!/bin/bash

# PST Backend-Only Startup
# Use this to start just the Django backend server

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python3 -m venv .venv"
    exit 1
fi

source .venv/bin/activate

# Kill existing process on 8000
lsof -ti:8000 > /dev/null 2>&1 && kill -9 $(lsof -ti:8000) 2>/dev/null

cd backend

echo ""
echo "=========================================="
echo "🎯 Starting PST Backend Server"
echo "=========================================="
echo ""
echo "📡 Backend API: http://localhost:8000"
echo "🔧 Admin Panel: http://localhost:8000/admin"
echo ""
echo "✅ API Root: http://localhost:8000"
echo ""
echo "⏹️  To stop, press Ctrl+C"
echo "=========================================="
echo ""

python manage.py runserver 0.0.0.0:8000
