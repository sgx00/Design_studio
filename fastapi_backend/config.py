"""
Configuration settings for FastAPI Fashion Agent Backend
"""

import os
from typing import List, Optional
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    app_name: str = "LangGraph Fashion Agent API"
    app_version: str = "1.0.0"
    debug: bool = Field(default=False, env="DEBUG")
    
    # Server Configuration
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    reload: bool = Field(default=False, env="RELOAD")
    
    # CORS Configuration
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8080"],
        env="CORS_ORIGINS"
    )
    cors_allow_credentials: bool = True
    cors_allow_methods: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    cors_allow_headers: List[str] = ["*"]
    
    # Security
    trusted_hosts: List[str] = Field(default=["*"], env="TRUSTED_HOSTS")
    
    # File Upload Configuration
    upload_dir: str = Field(default="../uploads", env="UPLOAD_DIR")
    max_file_size: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    allowed_image_types: List[str] = ["image/png", "image/jpeg", "image/jpg", "image/gif"]
    
    # API Keys
    google_api_key: str = Field(env="GOOGLE_API_KEY")
    tavily_api_key: str = Field(env="TAVILY_API_KEY")
    
    # LangGraph Configuration
    max_designs_per_request: int = Field(default=5, env="MAX_DESIGNS_PER_REQUEST")
    design_quality_threshold: float = Field(default=0.8, env="DESIGN_QUALITY_THRESHOLD")
    trend_confidence_threshold: float = Field(default=0.7, env="TREND_CONFIDENCE_THRESHOLD")
    
    # Rate Limiting
    rate_limit_requests: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=3600, env="RATE_LIMIT_WINDOW")  # 1 hour
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Database (for future use)
    database_url: Optional[str] = Field(default=None, env="DATABASE_URL")
    
    # Redis (for caching)
    redis_url: Optional[str] = Field(default=None, env="REDIS_URL")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# Global settings instance
settings = Settings()

# Validation
def validate_settings():
    """Validate required settings"""
    required_vars = ["GOOGLE_API_KEY", "TAVILY_API_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not getattr(settings, var.lower(), None):
            missing_vars.append(var)
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    return True

# API Documentation Configuration
api_docs_config = {
    "title": settings.app_name,
    "description": """
    ## LangGraph Fashion Agent API
    
    This API provides AI-powered fashion trend analysis and design generation capabilities.
    
    ### Features:
    - **Trend Analysis**: Real-time fashion trend analysis using web search and AI
    - **Design Generation**: AI-generated fashion designs based on current trends
    - **Image Creation**: High-quality product photographs using Gemini 2.5 Flash
    - **Multiple Strategies**: Various design approaches (trend-following, trend-leading, etc.)
    
    ### Authentication:
    Currently no authentication is required, but API keys are needed for external services.
    
    ### Rate Limiting:
    API requests are rate-limited to prevent abuse.
    """,
    "version": settings.app_version,
    "contact": {
        "name": "Fashion Agent API Support",
        "email": "support@fashionagent.com",
    },
    "license_info": {
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    "servers": [
        {
            "url": f"http://{settings.host}:{settings.port}",
            "description": "Development server"
        }
    ],
    "tags_metadata": [
        {
            "name": "designs",
            "description": "Fashion design generation and management",
        },
        {
            "name": "trends",
            "description": "Fashion trend analysis and forecasting",
        },
        {
            "name": "images",
            "description": "Generated image management and serving",
        },
        {
            "name": "health",
            "description": "Health checks and system status",
        },
    ],
}
