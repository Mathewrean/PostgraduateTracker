#!/bin/bash

# PST Application Startup Script
# Starts both Django backend and React frontend servers

echo "=========================================="
echo "🚀 PST Application Startup"
echo "=========================================="
echo ""

# Check if venv exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python3 -m venv .venv"
    exit 1
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source .venv/bin/activate

# Check if we're in the venv
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "❌ Failed to activate virtual environment"
    exit 1
fi

echo "✅ Virtual environment activated"
echo ""

# Kill any existing processes on ports 8000 and 5173
echo "🔍 Checking for existing processes..."
lsof -ti:8000 > /dev/null 2>&1 && kill -9 $(lsof -ti:8000) 2>/dev/null && echo "✅ Killed existing backend process"
lsof -ti:5173 > /dev/null 2>&1 && kill -9 $(lsof -ti:5173) 2>/dev/null && echo "✅ Killed existing frontend process"

echo ""
echo "=========================================="
echo "🎯 Starting Backend Server"
echo "=========================================="
echo "📡 Backend will run at http://localhost:8000"
echo "API endpoints: http://localhost:8000/api/"
echo ""

cd backend

# Run Django development server in background
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend started (PID: $BACKEND_PID)"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Go back to root
cd ..

echo ""
echo "=========================================="
echo "🎯 Starting Frontend Server"
echo "=========================================="
echo "🌐 Frontend will run at http://localhost:5173"
echo ""

cd frontend

# Run Vite development server in background
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 3

# Check if frontend is running
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend failed to start"
    kill -9 $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ PST SERVERS RUNNING"
echo "=========================================="
echo ""
echo "📍 Access Points:"
echo "   🌐 Frontend: http://localhost:5173"
echo "   📡 Backend:  http://localhost:8000"
echo "   🔧 Admin:    http://localhost:8000/admin"
echo ""
echo "🔐 Test Credentials:"
echo "   Email: admin@pst.com"
echo "   Password: admin123"
echo ""
echo "📚 Documentation:"
echo "   README: ./README.md"
echo "   TEST REPORT: ./TEST_REPORT.md"
echo "   FIXES: ./FIXES_COMPLETED.md"
echo ""
echo "⏹️  To stop servers, press Ctrl+C"
echo "=========================================="
echo ""

# Keep script running and handle signals
trap "echo ''; echo '⏹️  Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait for both processes
wait
