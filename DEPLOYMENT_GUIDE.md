# 🚀 AI Fashion Design Platform - Deployment Guide

This guide provides step-by-step instructions for hosting your AI Fashion Design Platform as a live demo website.

## 📋 Prerequisites

- GitHub account
- Google Cloud Platform account (for Vertex AI)
- API keys for optional services (News API, etc.)

## 🎯 **Option 1: Vercel + Railway (Recommended)**

### Frontend (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Set build settings:
     - **Framework Preset**: Create React App
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
   - Add environment variables:
     ```
     REACT_APP_API_URL=https://your-railway-backend.railway.app
     REACT_APP_FASTAPI_URL=https://your-railway-fastapi.railway.app
     ```

### Backend (Railway)

1. **Deploy Node.js Backend**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Node.js
   - Add environment variables:
     ```
     NODE_ENV=production
     PORT=3001
     GOOGLE_API_KEY=your_google_api_key
     ```

2. **Deploy FastAPI Backend**
   - Create another Railway project
   - Set **Root Directory**: `fastapi_backend`
   - Railway will auto-detect Python
   - Add environment variables:
     ```
     GOOGLE_API_KEY=your_google_api_key
     TAVILY_API_KEY=your_tavily_key
     ```

3. **Update Frontend URLs**
   - Update `vercel.json` with your Railway URLs
   - Redeploy Vercel

## 🎯 **Option 2: Netlify + Heroku**

### Frontend (Netlify)

1. **Build Settings**
   - **Build Command**: `cd client && npm run build`
   - **Publish Directory**: `client/build`
   - **Environment Variables**:
     ```
     REACT_APP_API_URL=https://your-heroku-app.herokuapp.com
     ```

### Backend (Heroku)

1. **Create Heroku Apps**
   ```bash
   # Install Heroku CLI
   heroku create your-app-name
   heroku create your-fastapi-name
   ```

2. **Deploy Node.js Backend**
   ```bash
   git subtree push --prefix=. heroku main
   ```

3. **Deploy FastAPI Backend**
   ```bash
   git subtree push --prefix=fastapi_backend heroku-fastapi main
   ```

## 🎯 **Option 3: DigitalOcean App Platform**

1. **Create App**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect GitHub repository

2. **Configure Services**
   - **Frontend Service**:
     - Source: `client/`
     - Build Command: `npm run build`
     - Run Command: `npm start`
   
   - **Backend Service**:
     - Source: `.` (root)
     - Build Command: `npm install`
     - Run Command: `npm start`
   
   - **FastAPI Service**:
     - Source: `fastapi_backend/`
     - Build Command: `pip install -r requirements_frozen.txt`
     - Run Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 🎯 **Option 4: Docker Deployment**

### Local Testing
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access at:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# FastAPI: http://localhost:8000
```

### Deploy to Cloud
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**

## 🔧 **Environment Setup**

### Required Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env
```

### Essential Variables:
```env
GOOGLE_API_KEY=your_google_vertex_ai_key
NODE_ENV=production
PORT=3001
```

### Optional Variables (for enhanced features):
```env
NEWS_API_KEY=your_news_api_key
PINTEREST_API_KEY=your_pinterest_key
TAVILY_API_KEY=your_tavily_key
```

## 🚀 **Quick Start Commands**

### Local Development
```bash
# Install dependencies
npm install
cd client && npm install

# Start all services
npm run dev  # Starts backend
cd client && npm start  # Starts frontend
python run_fastapi.py  # Starts FastAPI
```

### Production Build
```bash
# Build frontend
cd client && npm run build

# Start production servers
NODE_ENV=production npm start
```

## 🔍 **Testing Your Deployment**

1. **Health Checks**
   - Frontend: `https://your-domain.com`
   - Backend: `https://your-backend.com/api/health`
   - FastAPI: `https://your-fastapi.com/health`

2. **Test Features**
   - Upload an image
   - Generate a design
   - Check trend analysis

## 🛠 **Troubleshooting**

### Common Issues

1. **CORS Errors**
   - Update CORS settings in `server.js`
   - Add your frontend domain to allowed origins

2. **API Key Issues**
   - Verify Google API key is valid
   - Check environment variables are set

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

4. **File Upload Issues**
   - Ensure uploads directory exists
   - Check file size limits

### Debug Commands
```bash
# Check environment variables
echo $GOOGLE_API_KEY

# Test API endpoints
curl https://your-backend.com/api/health
curl https://your-fastapi.com/health

# Check logs
heroku logs --tail  # For Heroku
railway logs        # For Railway
```

## 📊 **Performance Optimization**

1. **Frontend**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement lazy loading

2. **Backend**
   - Add caching headers
   - Optimize image processing
   - Use connection pooling

3. **Database**
   - Add indexes for queries
   - Implement query optimization

## 🔒 **Security Considerations**

1. **Environment Variables**
   - Never commit API keys to git
   - Use secure environment variable storage

2. **CORS Configuration**
   - Restrict origins to your domains
   - Use HTTPS in production

3. **File Uploads**
   - Validate file types
   - Implement size limits
   - Scan for malware

## 📈 **Monitoring & Analytics**

1. **Add Monitoring**
   - Uptime monitoring (UptimeRobot)
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)

2. **Analytics**
   - Google Analytics
   - User behavior tracking

## 🎉 **Success Checklist**

- [ ] Frontend deployed and accessible
- [ ] Backend API responding
- [ ] FastAPI service running
- [ ] File uploads working
- [ ] AI features functional
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] Domain configured (optional)

## 📞 **Support**

If you encounter issues:
1. Check the logs for error messages
2. Verify environment variables
3. Test API endpoints individually
4. Check CORS configuration
5. Ensure all services are running

---

**🎊 Congratulations!** Your AI Fashion Design Platform is now live and ready to showcase your skills!
