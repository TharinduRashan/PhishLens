import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base


class ScanRecord(Base):
    """Represents a recorded scan request and assessment state."""
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    target = Column(String(2048), nullable=False, index=True)
    target_hash = Column(String(64), nullable=True, index=True)
    scan_type = Column(String(20), nullable=False, default="URL")  # URL, EMAIL
    risk_level = Column(String(20), nullable=False, default="UNKNOWN")  # SAFE, SUSPICIOUS, MALICIOUS, UNKNOWN
    threat_score = Column(Integer, nullable=False, default=0)
    engine_status = Column(String(50), nullable=False, default="engine_pending")
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    indicators = relationship(
        "ThreatIndicatorRecord",
        back_populates="scan",
        cascade="all, delete-orphan"
    )


class ThreatIndicatorRecord(Base):
    """Granular technical heuristics triggered or evaluated during a scan."""
    __tablename__ = "threat_indicators"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(50), nullable=False)
    name = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False, default="LOW")
    description = Column(Text, nullable=False)
    detected = Column(Boolean, nullable=False, default=False)

    scan = relationship("ScanRecord", back_populates="indicators")
