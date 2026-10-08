"""FastAPI Main Application Entrypoint for Opporbyte."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.init_db import init_db
from app.db.session import SessionLocal

logger = logging.getLogger("opporbyte")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle management."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION}...")
    try:
        with SessionLocal() as db_session:
            init_db(db_session)
        logger.info("Database initialized and verified.")
    except Exception as exc:
        logger.error(f"Failed to initialize database during startup: {exc}")
    yield
    logger.info("Shutting down Opporbyte service.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Your opportunities. One intelligent engine. Private single-user career platform.",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS configuration for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register v1 API routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root_info():
    """Service metadata and API documentation pointer."""
    return {
        "app": settings.APP_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": f"{settings.API_V1_STR}/docs",
        "api_v1": settings.API_V1_STR,
    }
