import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("phishlens.db")

Base = declarative_base()

# Configure database engine with graceful fallback
# If a PostgreSQL URL is supplied, we attempt connection; if unavailable or configured for sqlite,
# we fall back to SQLite so developer does not need a local PostgreSQL service running for Phase 1.
def create_app_engine():
    db_url = settings.DATABASE_URL
    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    try:
        engine = create_engine(db_url, connect_args=connect_args)
        # Test connection
        with engine.connect() as conn:
            pass
        return engine
    except Exception as exc:
        logger.warning(
            f"Could not connect to configured database at '{db_url}'. "
            f"Falling back to local SQLite engine for Phase 1: {exc}"
        )
        fallback_url = "sqlite:///./phishlens_fallback.db"
        return create_engine(fallback_url, connect_args={"check_same_thread": False})


engine = create_app_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initializes tables on startup."""
    try:
        import app.models  # ensure models are registered
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        logger.error(f"Error initializing database schema: {exc}")


# Auto-initialize tables for immediate Phase 1 availability
init_db()
