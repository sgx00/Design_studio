#!/bin/bash

# LangGraph Fashion Agent Setup Script
# This script sets up the Python environment and dependencies for the LangGraph Fashion Agent

echo "🚀 Setting up LangGraph Fashion Agent..."
echo "========================================"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

echo "✅ pip3 found: $(pip3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements_langgraph.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️ .env file not found. Creating template..."
    cat > .env << EOF
# Google API Key for Gemini models
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Debug mode
DEBUG=0
EOF
    echo "✅ .env template created. Please add your Google API key."
else
    echo "✅ .env file exists"
fi

# Check if Google API key is set
if grep -q "your_google_api_key_here" .env; then
    echo "⚠️ Please update .env file with your actual Google API key"
    echo "   Get your API key from: https://ai.google.dev/"
else
    echo "✅ Google API key appears to be configured"
fi

# Create temp directory
echo "📁 Creating temp directory..."
mkdir -p temp
echo "✅ Temp directory created"

# Test Python imports
echo "🧪 Testing Python imports..."
python3 -c "
try:
    import langgraph
    import google.generativeai
    import asyncio
    from pathlib import Path
    print('✅ All required Python packages imported successfully')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
"

if [ $? -eq 0 ]; then
    echo "✅ Python environment setup complete!"
else
    echo "❌ Python environment setup failed"
    exit 1
fi

# Test the LangGraph agent
echo "🧪 Testing LangGraph Fashion Agent..."
python3 -c "
import asyncio
import sys
from pathlib import Path
sys.path.append(str(Path.cwd() / 'services'))

try:
    from langgraphFashionAgent import LangGraphFashionAgent
    print('✅ LangGraph Fashion Agent imported successfully')
    
    # Test initialization
    agent = LangGraphFashionAgent()
    print('✅ LangGraph Fashion Agent initialized successfully')
    
except Exception as e:
    print(f'❌ Error testing LangGraph agent: {e}')
    exit(1)
"

if [ $? -eq 0 ]; then
    echo "✅ LangGraph Fashion Agent test passed!"
else
    echo "❌ LangGraph Fashion Agent test failed"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Make sure your Google API key is set in .env"
echo "2. Start the Node.js server: npm start"
echo "3. Test the integration: node test_langgraph_integration.js"
echo "4. Test the Python agent: python test_langgraph_agent.py"
echo ""
echo "Available endpoints:"
echo "- POST /api/langgraph-fashion-agent/generate"
echo "- GET /api/langgraph-fashion-agent/status"
echo ""
echo "For more information, see LANGGRAPH_FASHION_AGENT_README.md"
