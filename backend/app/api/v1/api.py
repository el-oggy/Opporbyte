"""API v1 master router."""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.matches import router as matches_router
from app.api.v1.profiles import router as profiles_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="", tags=["Health"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profiles_router, prefix="/profiles", tags=["Career Profiles"])
api_router.include_router(jobs_router, prefix="/jobs", tags=["Jobs & Discovery"])
api_router.include_router(matches_router, prefix="/matches", tags=["AI Matching"])
