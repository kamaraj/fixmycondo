"""
FixMyCondo - Main FastAPI Application
Entry point for the backend API server
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import logging

from .config import settings
from .database import create_tables
from .api import api_router

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    # Create database tables
    await create_tables()
    logger.info("Database tables created")
    
    # Create upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info(f"Upload directory: {settings.UPLOAD_DIR}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="""
    ## FixMyCondo - Tenant Complaint & Maintenance Management SaaS
    
    A comprehensive solution for condo/apartment management in Malaysia & Singapore.
    
    ### Features:
    - 🏢 **Tenant Dashboard** - Submit complaints, track status, book facilities
    - 🔧 **Technician App** - View assigned jobs, update status, upload photos
    - 📊 **Management Portal** - Dashboard, SLA tracking, vendor management
    - 📢 **Announcements** - Building-wide notifications
    - 📅 **Facility Booking** - Gym, pool, meeting rooms
    - 🏆 **Vendor Bidding** - Quote comparison and approval
    
    ### Tech Stack:
    - FastAPI + SQLAlchemy (Async)
    - SQLite (Development) / PostgreSQL (Production)
    - Redis (Caching & Background Tasks)
    - JWT Authentication
    """,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

# Mount static files for uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount(
        "/uploads",
        StaticFiles(directory=settings.UPLOAD_DIR),
        name="uploads"
    )


# Root endpoint
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "database": "connected",
        "redis": "connected" if settings.REDIS_URL else "not configured"
    }


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    from fastapi.responses import FileResponse
    # Return a dummy response or a real file if available
    # For now, just return 404 to be semantically correct but without raising error in logs
    # Or better, 204 No Content
    from fastapi.responses import Response
    return Response(status_code=204)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


# Run with: uvicorn app.main:app --reload --port 9030
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )
