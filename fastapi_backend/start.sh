#!/bin/bash

# FastAPI Fashion Agent Backend Startup Script

set -e

echo "🚀 Starting FastAPI Fashion Agent Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "📝 Please edit .env file with your API keys before running again."
        echo "   Required: GOOGLE_API_KEY and TAVILY_API_KEY"
        exit 1
    else
        echo "❌ env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Load environment variables
source .env

# Check required environment variables
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "❌ GOOGLE_API_KEY is required. Please set it in .env file."
    exit 1
fi

if [ -z "$TAVILY_API_KEY" ]; then
    echo "❌ TAVILY_API_KEY is required. Please set it in .env file."
    exit 1
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Use existing project venv
PROJECT_ROOT="$(dirname "$0")/.."
VENV_PATH="$PROJECT_ROOT/venv"

if [ ! -d "$VENV_PATH" ]; then
    echo "❌ Virtual environment not found at $VENV_PATH"
    echo "   Please ensure the project venv is set up first."
    exit 1
fi

echo "✅ Using existing virtual environment at $VENV_PATH"
source "$VENV_PATH/bin/activate"

# Install FastAPI dependencies if not already installed
#echo "📦 Checking FastAPI dependencies..."
#pip install -r requirements.txt

# Run the FastAPI application
echo "🌟 Starting FastAPI server on http://${HOST:-0.0.0.0}:${PORT:-8000}"
echo "📚 API Documentation: http://${HOST:-0.0.0.0}:${PORT:-8000}/docs"
echo "🔍 Health Check: http://${HOST:-0.0.0.0}:${PORT:-8000}/health"

# Set reload flag based on environment variable
RELOAD_FLAG=""
if [ "${RELOAD:-false}" = "true" ]; then
    RELOAD_FLAG="--reload"
fi

exec uvicorn main:app \
    --host ${HOST:-0.0.0.0} \
    --port ${PORT:-8000} \
    $RELOAD_FLAG \
    --log-level ${LOG_LEVEL:-info}
