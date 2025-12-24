"""
FixMyCondo - Application Configuration
Settings management using Pydantic
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
from typing import Optional, List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "FixMyCondo"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    PORT: int = 9030
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///" + (
        "/tmp/fixmycondo.db" if os.environ.get("VERCEL") else "./fixmycondo.db"
    )
    
    # Redis
    REDIS_URL: Optional[str] = None
    
    # JWT Configuration
    JWT_SECRET_KEY: str = "jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # File Upload
    UPLOAD_DIR: str = "/tmp/uploads" if os.environ.get("VERCEL") else "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/gif"]
    ALLOWED_VIDEO_TYPES: List[str] = ["video/mp4", "video/quicktime"]
    ALLOWED_DOCUMENT_TYPES: List[str] = ["application/pdf"]
    
    # SLA Configuration (in hours)
    SLA_LOW_PRIORITY: int = 72  # 3 days
    SLA_MEDIUM_PRIORITY: int = 48  # 2 days
    SLA_HIGH_PRIORITY: int = 24  # 1 day
    SLA_CRITICAL_PRIORITY: int = 4  # 4 hours
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # CORS - accepts comma-separated string from env
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8081,http://localhost:19006,*"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
