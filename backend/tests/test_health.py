from app.main import root
from app.api.v1.endpoints.health import get_health_status
from app.db.session import SessionLocal


def test_root_endpoint():
    data = root()
    assert data["platform"] == "PhishLens API"
    assert "version" in data
    assert "tagline" in data


def test_health_endpoint():
    db = SessionLocal()
    try:
        res = get_health_status(db=db)
        assert res.status == "success"
        assert res.data.status == "healthy"
        assert res.data.database in ["connected", "unreachable"]
        assert "url_inspection_v1" in res.data.capabilities
    finally:
        db.close()
