import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.schemas.common import APIResponse, HealthResponse

router = APIRouter()
START_TIME = time.time()


@router.get(
    "/health",
    response_model=APIResponse[HealthResponse],
    summary="Platform Health & Status",
    description="Returns operational telemetry, uptime, version, and database status."
)
def get_health_status(db: Session = Depends(get_db)):
    # Check DB connectivity
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unreachable ({type(exc).__name__})"

    uptime = round(time.time() - START_TIME, 2)

    payload = HealthResponse(
        status="healthy",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        uptime_seconds=uptime,
        database=db_status,
        timestamp=datetime.now(timezone.utc),
        capabilities=[
            "url_inspection_v1",
            "email_heuristics_v1",
            "ssrf_protection_guard",
            "threat_database_sync"
        ]
    )

    return APIResponse(
        status="success",
        message="PhishLens platform services are operational.",
        data=payload
    )
