"""
FastAPI Backend Microservice for LangGraph Fashion Agent
Provides REST API endpoints for trend analysis and design generation
"""

import os
import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any, List, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, validator
import uvicorn

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Import the LangGraph Fashion Agent
import sys
# Add the parent directory to Python path to import from services
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services.langgraphFashionAgent import LangGraphFashionAgent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global agent instance
fashion_agent: Optional[LangGraphFashionAgent] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global fashion_agent
    
    # Startup
    logger.info("🚀 Starting FastAPI Fashion Agent Backend...")
    try:
        fashion_agent = LangGraphFashionAgent()
        logger.info("✅ LangGraph Fashion Agent initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Fashion Agent: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down FastAPI Fashion Agent Backend...")

# Create FastAPI app
app = FastAPI(
    title="LangGraph Fashion Agent API",
    description="AI-powered fashion trend analysis and design generation microservice",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure appropriately for production
)

# Mount static files for serving generated images
# Try multiple possible uploads directories
uploads_dirs = ["uploads"]
for uploads_dir in uploads_dirs:
    if os.path.exists(uploads_dir):
        app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
        break

# Pydantic Models
class DesignRequest(BaseModel):
    """Request model for design generation"""
    garmentType: str = Field(..., description="Type of garment (e.g., dress, shirt, jacket)")
    category: str = Field(..., description="Garment category (e.g., dresses, tops, bottoms)")
    strategy: str = Field("balanced", description="Design strategy (trend_following, trend_leading, balanced, sustainable)")
    count: int = Field(3, ge=1, le=10, description="Number of designs to generate (1-10)")
    targetAudience: str = Field("general", description="Target audience for the designs")
    occasion: str = Field("everyday", description="Occasion for the designs")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="Additional design preferences")
    
    @validator('strategy')
    def validate_strategy(cls, v):
        valid_strategies = ["trend_following", "trend_leading", "balanced", "sustainable"]
        if v not in valid_strategies:
            raise ValueError(f"Strategy must be one of: {valid_strategies}")
        return v
    
    @validator('category')
    def validate_category(cls, v):
        valid_categories = ["dresses", "tops", "bottoms", "outerwear", "all"]
        if v not in valid_categories:
            raise ValueError(f"Category must be one of: {valid_categories}")
        return v

class TrendAnalysisRequest(BaseModel):
    """Request model for trend analysis"""
    category: str = Field(..., description="Garment category to analyze")
    garmentType: str = Field("general", description="Specific garment type")
    season: Optional[str] = Field(None, description="Season to analyze (auto-detected if not provided)")
    year: Optional[int] = Field(None, description="Year to analyze (current year if not provided)")

class DesignResponse(BaseModel):
    """Response model for design generation"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class TrendAnalysisResponse(BaseModel):
    """Response model for trend analysis"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    version: str = "1.0.0"
    agent_status: str

# Dependency to get the fashion agent
async def get_fashion_agent() -> LangGraphFashionAgent:
    """Dependency to get the fashion agent instance"""
    if fashion_agent is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Fashion agent not initialized"
        )
    return fashion_agent

# API Endpoints

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "LangGraph Fashion Agent API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check(agent: LangGraphFashionAgent = Depends(get_fashion_agent)):
    """Health check endpoint"""
    try:
        # Test agent functionality
        agent_status = "healthy" if agent is not None else "unhealthy"
        return HealthResponse(
            status="healthy",
            agent_status=agent_status
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            agent_status="error"
        )

@app.post("/api/v1/designs/generate", response_model=DesignResponse)
async def generate_designs(
    request: DesignRequest,
    background_tasks: BackgroundTasks,
    agent: LangGraphFashionAgent = Depends(get_fashion_agent)
):
    """
    Generate fashion designs based on trends and preferences
    """
    try:
        logger.info(f"🎨 Generating designs for {request.garmentType} ({request.category})")
        
        # Convert request to agent format
        agent_request = {
            "garmentType": request.garmentType,
            "category": request.category,
            "strategy": request.strategy,
            "count": request.count,
            "targetAudience": request.targetAudience,
            "occasion": request.occasion,
            "preferences": request.preferences
        }
        
        # Generate designs using the agent
        result = await agent.generate_trend_based_designs(agent_request)
        
        if result.get("success", False):
            logger.info("✅ Design generation completed successfully")
            return DesignResponse(
                success=True,
                message="Designs generated successfully",
                data=result
            )
        else:
            logger.error(f"❌ Design generation failed: {result.get('error', 'Unknown error')}")
            return DesignResponse(
                success=False,
                message="Design generation failed",
                error=result.get("error", "Unknown error"),
                data=result
            )
            
    except Exception as e:
        logger.error(f"❌ Error in design generation endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/api/v1/trends/analyze", response_model=TrendAnalysisResponse)
async def analyze_trends(
    request: TrendAnalysisRequest,
    agent: LangGraphFashionAgent = Depends(get_fashion_agent)
):
    """
    Analyze current fashion trends for a specific category
    """
    try:
        logger.info(f"🔍 Analyzing trends for {request.category}")
        
        # Create a minimal request for trend analysis
        trend_request = {
            "garmentType": request.garmentType,
            "category": request.category,
            "strategy": "balanced",
            "count": 1,
            "targetAudience": "general",
            "occasion": "everyday",
            "preferences": {}
        }
        
        # Initialize state for trend analysis only
        initial_state = {
            "request": trend_request,
            "garment_type": request.garmentType,
            "category": request.category,
            "strategy": "balanced",
            "count": 1,
            "target_audience": "general",
            "occasion": "everyday",
            "preferences": {},
            "current_step": "initialized",
            "iteration_count": 0,
            "max_iterations": 1,
            "error_messages": [],
            "success": False,
            "final_result": None
        }
        
        # Run only trend analysis
        trend_result = agent.trend_analysis_node(initial_state)
        
        if trend_result.get("trend_analysis"):
            logger.info("✅ Trend analysis completed successfully")
            return TrendAnalysisResponse(
                success=True,
                message="Trend analysis completed successfully",
                data=trend_result
            )
        else:
            logger.error("❌ Trend analysis failed")
            return TrendAnalysisResponse(
                success=False,
                message="Trend analysis failed",
                error="No trend data generated"
            )
            
    except Exception as e:
        logger.error(f"❌ Error in trend analysis endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/api/v1/designs/strategies")
async def get_design_strategies():
    """
    Get available design strategies
    """
    return {
        "strategies": {
            "trend_following": {
                "description": "Follow current trends closely",
                "trend_weight": 0.9,
                "creativity_weight": 0.1,
                "market_fit_weight": 0.8
            },
            "trend_leading": {
                "description": "Lead trends with innovative designs",
                "trend_weight": 0.6,
                "creativity_weight": 0.9,
                "market_fit_weight": 0.5
            },
            "balanced": {
                "description": "Balance trends with timeless appeal",
                "trend_weight": 0.7,
                "creativity_weight": 0.5,
                "market_fit_weight": 0.9
            },
            "sustainable": {
                "description": "Focus on sustainable and ethical design",
                "trend_weight": 0.5,
                "creativity_weight": 0.7,
                "market_fit_weight": 0.8
            }
        }
    }

@app.get("/api/v1/designs/categories")
async def get_garment_categories():
    """
    Get available garment categories and types
    """
    return {
        "categories": {
            "dresses": {
                "types": ["casual dress", "formal dress", "maxi dress", "mini dress", "midi dress"],
                "complexity": "high",
                "trend_sensitivity": "very high"
            },
            "tops": {
                "types": ["t-shirt", "blouse", "shirt", "sweater", "jacket", "blazer"],
                "complexity": "medium",
                "trend_sensitivity": "high"
            },
            "bottoms": {
                "types": ["pants", "jeans", "shorts", "skirt", "leggings"],
                "complexity": "medium",
                "trend_sensitivity": "high"
            },
            "outerwear": {
                "types": ["coat", "jacket", "blazer", "cardigan", "vest"],
                "complexity": "high",
                "trend_sensitivity": "medium"
            }
        }
    }

@app.get("/api/v1/images/{filename}")
async def get_generated_image(filename: str):
    """
    Serve generated images
    """
    # Try multiple possible locations for the image
    possible_paths = [
        f"/uploads/{filename}",  # Local uploads directory
        # Parent directory uploads
        f"../fastapi_backend/uploads/{filename}",  # From project root
    ]
    
    for image_path in possible_paths:
        if os.path.exists(image_path):
            return FileResponse(image_path)
    
    # If not found in any location, return 404
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Image not found: {filename}"
    )

@app.get("/api/v1/images")
async def list_generated_images():
    """
    List all generated images
    """
    try:
        uploads_dir = "../uploads"
        if not os.path.exists(uploads_dir):
            return {"images": []}
        
        images = []
        for filename in os.listdir(uploads_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                file_path = os.path.join(uploads_dir, filename)
                stat = os.stat(file_path)
                images.append({
                    "filename": filename,
                    "size": stat.st_size,
                    "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "url": f"/api/v1/images/{filename}"
                })
        
        # Sort by creation time (newest first)
        images.sort(key=lambda x: x["created"], reverse=True)
        
        return {"images": images}
        
    except Exception as e:
        logger.error(f"Error listing images: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing images: {str(e)}"
        )

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error",
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    # Run the FastAPI application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
