"""
FixMyCondo - API Routes Package
Consolidates all API routers
"""
from fastapi import APIRouter
from .auth import router as auth_router
from .complaints import router as complaints_router
from .buildings import router as buildings_router
from .facilities import router as facilities_router
from .vendors import router as vendors_router
from .announcements import router as announcements_router
from .dashboard import router as dashboard_router

# Create main API router
api_router = APIRouter(prefix="/api")

# Include all sub-routers
api_router.include_router(auth_router)
api_router.include_router(complaints_router)
api_router.include_router(buildings_router)
api_router.include_router(facilities_router)
api_router.include_router(vendors_router)
api_router.include_router(announcements_router)
api_router.include_router(dashboard_router)

__all__ = ["api_router"]
