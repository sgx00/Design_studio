#!/bin/bash

# Script to update frozen requirements from virtual environment
# Run this script whenever you install new packages in your venv

echo "🔄 Updating frozen requirements from virtual environment..."

# Check if virtual environment exists
if [ ! -d "../venv" ]; then
    echo "❌ Virtual environment not found at ../venv"
    echo "Please create a virtual environment first:"
    echo "  python -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements_2.txt"
    exit 1
fi

# Activate virtual environment and freeze requirements
source ../venv/bin/activate

echo "📦 Freezing current environment..."
pip freeze > requirements_frozen.txt

echo "✅ Requirements frozen to requirements_frozen.txt"
echo "📊 Total packages: $(wc -l < requirements_frozen.txt)"

# Show some key packages
echo ""
echo "🔍 Key packages in frozen requirements:"
grep -E "(fastapi|uvicorn|langgraph|langchain|google-generativeai|pydantic)" requirements_frozen.txt

echo ""
echo "🐳 Ready for Docker build!"
echo "Run: docker build -t fashion-agent-api ."
