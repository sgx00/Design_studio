# How to Start the Project

This guide will help you get the StyleSynapse.ai project up and running.

## Project Architecture

This project consists of three main components:
1. **Node.js/Express Backend** (port 3001) - Main API server
2. **React Frontend** (port 3000) - Web interface
3. **FastAPI Python Backend** (port 8000) - LangGraph Fashion Agent service

## Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **pip** (Python package manager)

## Step-by-Step Setup

### 1. Install Node.js Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Set Up Python Virtual Environment

```bash
# Create virtual environment (if not already created)
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate

# Install Python dependencies
cd fastapi_backend
pip install -r requirements_frozen.txt
cd ..
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Node.js Backend
NODE_ENV=development
PORT=3001

# Google Cloud / Vertex AI (Required for AI features)
GOOGLE_CLOUD_PROJECT=your_google_cloud_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_service_account_key.json
# OR use API key:
GOOGLE_API_KEY=your_google_api_key

# Tavily API (Required for LangGraph agent)
TAVILY_API_KEY=your_tavily_api_key

# Optional: Trend Analysis APIs
NEWS_API_KEY=your_news_api_key
PINTEREST_API_KEY=your_pinterest_key
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
TWITTER_BEARER_TOKEN=your_twitter_token
```

Also create a `.env` file in `fastapi_backend/` directory:

```env
GOOGLE_API_KEY=your_google_api_key
TAVILY_API_KEY=your_tavily_api_key
```

> **Note**: See `API_SETUP.md` and `VERTEXAI_SETUP.md` for detailed API setup instructions.

### 4. Start the Application

You have two options:

#### Option A: Start All Services Manually (Recommended for Development)

**Terminal 1 - Node.js Backend:**
```bash
npm start
# Server will run on http://localhost:3001
```

**Terminal 2 - React Frontend:**
```bash
npm run client
# Frontend will run on http://localhost:3000
```

**Terminal 3 - FastAPI Backend:**
```bash
# Activate virtual environment first
source venv/bin/activate  # macOS/Linux
# OR
# venv\Scripts\activate  # Windows

# Then start FastAPI
python run_fastapi.py
# OR
cd fastapi_backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# API will run on http://localhost:8000
```

#### Option B: Use Docker (For Production)

```bash
docker-compose up
```

This will start all services in containers.

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Node.js API**: http://localhost:3001
- **FastAPI API Docs**: http://localhost:8000/docs
- **FastAPI Health Check**: http://localhost:8000/health

## Quick Start (Minimal Setup)

If you just want to see the UI without full AI functionality:

1. Install dependencies:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. Start Node.js backend:
   ```bash
   npm start
   ```

3. In another terminal, start React frontend:
   ```bash
   npm run client
   ```

4. Open http://localhost:3000 in your browser

> **Note**: Some features require API keys. The app will work with fallback data if APIs are not configured.

## Troubleshooting

### Port Already in Use
If a port is already in use, you can change it:
- Node.js backend: Set `PORT=3002` in `.env`
- React frontend: Set `PORT=3001` in `client/.env` (or use `PORT=3001 npm start` in client)
- FastAPI: Change port in `run_fastapi.py` or use `--port 8001`

### Python Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r fastapi_backend/requirements_frozen.txt
```

### Missing Dependencies
```bash
# Node.js
npm install

# Python
source venv/bin/activate
pip install -r fastapi_backend/requirements_frozen.txt
```

### API Key Issues
- Check that `.env` files exist in both root and `fastapi_backend/` directories
- Verify API keys are correct
- Some features work without API keys (with fallback data)

## Development Tips

- Use `npm run dev` for Node.js backend with auto-reload (requires nodemon)
- FastAPI runs with `--reload` flag by default for auto-reload
- React frontend has hot-reload enabled by default
- Check browser console and terminal logs for errors

## Next Steps

- Read `API_SETUP.md` to configure trend analysis APIs
- Read `VERTEXAI_SETUP.md` to set up Google Vertex AI
- Read `LANGGRAPH_FASHION_AGENT_README.md` for LangGraph agent details

