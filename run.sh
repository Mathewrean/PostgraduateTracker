#!/bin/bash

# Define constants
PROJECT_ROOT=$(dirname "$(realpath "$0")")
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_PATH="$PROJECT_ROOT/.venv"

# --- Helper Functions ---
activate_venv() {
    echo "Activating virtual environment..."
    if [ -f "$VENV_PATH/bin/activate" ]; then
        source "$VENV_PATH/bin/activate"
        echo "✅ Virtual environment activated."
    elif [ -f "$VENV_PATH/Scripts/activate" ]; then # For Windows Git Bash
        source "$VENV_PATH/Scripts/activate"
        echo "✅ Virtual environment activated."
    else
        echo "❌ Virtual environment not found at $VENV_PATH/bin/activate or $VENV_PATH/Scripts/activate."
        echo "   Please create it by running: python3 -m venv .venv"
        echo "   And then activate it manually before running this script, or run: ./run.sh setup"
        exit 1
    fi
}

run_backend() {
    echo "--------------------------------------------------"
    echo "Starting Backend Server (in foreground)..."
    cd "$BACKEND_DIR" || { echo "❌ Failed to change directory to $BACKEND_DIR"; exit 1; }

    echo "If backend fails to start, ensure dependencies are installed: pip install -r requirements.txt"
    echo "Running Django development server..."
    python manage.py runserver 0.0.0.0:8000
    BACKEND_EXIT_CODE=$?

    if [ $BACKEND_EXIT_CODE -ne 0 ]; then
        echo "❌ Backend server exited with error code $BACKEND_EXIT_CODE."
        exit $BACKEND_EXIT_CODE
    fi
    echo "✅ Backend server exited gracefully."
    echo "--------------------------------------------------"
}

run_frontend() {
    echo "--------------------------------------------------"
    echo "Starting Frontend Server (in foreground)..."
    cd "$FRONTEND_DIR" || { echo "❌ Failed to change directory to $FRONTEND_DIR"; exit 1; }

    if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies (npm install)..."
        npm install
        if [ $? -ne 0 ]; then
            echo "❌ npm install failed. Please check your Node.js setup and internet connection."
            exit 1
        fi
        echo "✅ Frontend dependencies installed."
    fi

    echo "Running Vite development server..."
    npm run dev
    FRONTEND_EXIT_CODE=$?

    if [ $FRONTEND_EXIT_CODE -ne 0 ]; then
        echo "❌ Frontend server exited with error code $FRONTEND_EXIT_CODE."
        exit $FRONTEND_EXIT_CODE
    fi
    echo "✅ Frontend server exited gracefully."
    echo "--------------------------------------------------"
}

setup_env_and_deps() {
    echo "--------------------------------------------------"
    echo "Setting up Environment and Dependencies..."
    echo "1. Create a '.env' file in the '$BACKEND_DIR/' directory."
    echo "2. Copy the contents of '$BACKEND_DIR/.env.example' into your new '.env' file."
    echo "3. IMPORTANT: Update 'SECRET_KEY', 'JWT_SECRET_KEY', and any other sensitive credentials in '.env'."
    echo "   For development, you can use the defaults for DEBUG and ALLOWED_HOSTS."
    echo "--------------------------------------------------"
    echo ""

    activate_venv
    
    echo "Installing backend dependencies..."
    cd "$BACKEND_DIR" || { echo "❌ Failed to change directory to $BACKEND_DIR"; exit 1; }
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ pip install failed for backend. Please check your Python setup and internet connection."
        exit 1
    fi
    echo "✅ Backend dependencies installed."

    echo "Running Django migrations..."
    python manage.py makemigrations
    python manage.py migrate
    if [ $? -ne 0 ]; then
        echo "❌ Django migrations failed. Check database configuration."
        exit 1
    fi
    echo "✅ Django migrations complete."
    cd "$PROJECT_ROOT"

    echo "Installing frontend dependencies..."
    cd "$FRONTEND_DIR" || { echo "❌ Failed to change directory to $FRONTEND_DIR"; exit 1; }
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ npm install failed for frontend. Please check your Node.js setup and internet connection."
        exit 1
    fi
    echo "✅ Frontend dependencies installed."
    cd "$PROJECT_ROOT"

    echo "--------------------------------------------------"
    echo "Setup Complete! You can now run the backend and frontend separately."
    echo "To start backend: ./run.sh backend"
    echo "To start frontend: ./run.sh frontend"
    echo "--------------------------------------------------"
}

# --- Main Script Logic ---
if [ "$1" == "backend" ]; then
    activate_venv
    run_backend
elif [ "$1" == "frontend" ]; then
    run_frontend
elif [ "$1" == "setup" ]; then
    setup_env_and_deps
else
    echo "Usage: ./run.sh [backend|frontend|setup]"
    echo ""
    echo "  backend  : Starts the Django backend server in the foreground."
    echo "             (Ensure '.venv' is active or run './run.sh setup' first)."
    echo "  frontend : Starts the React frontend server in the foreground."
    echo "             (Ensure 'node_modules' are installed or run './run.sh setup' first)."
    echo "  setup    : Performs initial setup: creates venv, installs deps, runs migrations."
    echo ""
    echo "To run both, open two separate terminals and run './run.sh backend' in one, and './run.sh frontend' in the other."
    exit 1
fi
