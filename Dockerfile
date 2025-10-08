# Simplified Dockerfile for easier deployment
FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --omit=dev
RUN cd client && npm ci --omit=dev

# Copy source code
COPY . .

# Rebuild native modules for Linux (fixes Canvas compatibility)
RUN npm rebuild canvas

# Build frontend
RUN cd client && npm run build

# Install Python dependencies in virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --upgrade pip
RUN pip install -r fastapi_backend/requirements_frozen.txt

# Create uploads directory
RUN mkdir -p uploads fastapi_backend/uploads

# Expose ports
EXPOSE 3000 3001 8000

# Install serve package for React frontend
RUN npm install -g serve

# Start servers
CMD ["sh", "-c", "cd fastapi_backend && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 & npm start & serve -s client/build -l 3000"]
