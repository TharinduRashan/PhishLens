import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.api import api_router
from app.core.config import settings
from app.core.security import SSRFProtectionError, InvalidURLError
from app.db.session import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("phishlens.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing PhishLens Security Backend (Phase 1 Foundation)...")
    init_db()
    logger.info("Database schemas verified.")
    yield
    # Shutdown actions
    logger.info("PhishLens Backend shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Production-oriented foundation for **PhishLens** — AI-powered phishing detection "
        "and threat intelligence platform.\n\n"
        "Tagline: *See the threat behind the link.*"
    ),
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handlers
@app.exception_handler(SSRFProtectionError)
async def ssrf_exception_handler(request: Request, exc: SSRFProtectionError):
    logger.warning(f"SSRF Shield Triggered: {str(exc)} from {request.client.host if request.client else 'unknown'}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "error_type": "SSRFProtectionViolation",
            "message": str(exc),
        },
    )


@app.exception_handler(InvalidURLError)
async def invalid_url_exception_handler(request: Request, exc: InvalidURLError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "status": "error",
            "error_type": "InvalidURL",
            "message": str(exc),
        },
    )


# Register API v1 routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "phase": settings.PHASE_NAME,
        "documentation": f"{settings.API_V1_STR}/docs",
        "health_check": f"{settings.API_V1_STR}/health",
    }
