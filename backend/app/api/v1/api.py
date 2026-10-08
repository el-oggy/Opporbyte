"""API v1 master router."""

from fastapi import APIRouter

from app.api.v1.analytics import router as analytics_router
from app.api.v1.applications import router as applications_router
from app.api.v1.auth import router as auth_router
from app.api.v1.facts import router as facts_router
from app.api.v1.health import router as health_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.matches import router as matches_router
from app.api.v1.profiles import router as profiles_router
from app.api.v1.resumes import router as resumes_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="", tags=["Health"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profiles_router, prefix="/profiles", tags=["Career Profiles"])
api_router.include_router(jobs_router, prefix="/jobs", tags=["Jobs & Discovery"])
api_router.include_router(matches_router, prefix="/matches", tags=["AI Matching"])
api_router.include_router(facts_router, prefix="/facts", tags=["Candidate Facts & Provenance"])
api_router.include_router(resumes_router, prefix="/resumes", tags=["ATS Resume Engine"])
api_router.include_router(applications_router, prefix="/applications", tags=["Application Pipeline"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Career Analytics & Telemetry"])


