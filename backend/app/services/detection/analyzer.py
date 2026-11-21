import uuid
from datetime import datetime, timezone
from dataclasses import dataclass
from typing import Dict, List, Optional
from app.services.detection.url_parser import (
    URLParser,
    ParsedURLComponents,
    URLValidationError,
    UnsupportedSchemeError,
    InvalidHostnameError,
    InvalidPortError,
)
from app.services.detection.feature_extractor import FeatureExtractor, URLFeatures
from app.services.detection.rule_engine import RuleEngine, RuleIndicator
from app.services.detection.risk_scorer import RiskScorer, ScoredRiskResult


@dataclass
class URLAnalysisResult:
    """Full analysis output produced by the deterministic rule-based engine."""
    scan_id: str
    url: str
    status: str
    risk_score: int
    risk_level: str
    analysis_type: str
    summary: str
    features: dict
    indicators: List[dict]
    analyzed_at: str

    def to_dict(self) -> dict:
        return {
            "scan_id": self.scan_id,
            "url": self.url,
            "status": self.status,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "analysis_type": self.analysis_type,
            "summary": self.summary,
            "features": self.features,
            "indicators": self.indicators,
            "analyzed_at": self.analyzed_at,
        }


class URLThreatAnalyzer:
    """
    Main orchestration engine for Phase 2 deterministic URL threat detection.
    
    Guarantees:
    - 100% offline, zero-network operation.
    - Pure structural and lexical analysis.
    - Fully decoupled from web framework or database specifics.
    """

    def __init__(self, rule_weights: Optional[Dict[str, int]] = None):
        self.rule_engine = RuleEngine(weights=rule_weights)

    def analyze(self, raw_url: str) -> URLAnalysisResult:
        """
        Executes the end-to-end URL threat detection pipeline.
        
        Raises:
            UnsupportedSchemeError: If scheme is not http or https.
            InvalidHostnameError: If host is malformed or invalid.
            InvalidPortError: If specified port is outside 1-65535.
            URLValidationError: For any other syntactic or structural flaw.
        """
        scan_id = str(uuid.uuid4())
        analyzed_at = datetime.now(timezone.utc).isoformat()

        # Step 1: Parse and validate URL structure
        parsed: ParsedURLComponents = URLParser.parse(raw_url)

        # Step 2: Extract lexical and architectural features
        features: URLFeatures = FeatureExtractor.extract(parsed)

        # Step 3: Evaluate detection rules
        indicators: List[RuleIndicator] = self.rule_engine.evaluate(parsed, features)

        # Step 4: Calculate risk score and classification
        risk_result: ScoredRiskResult = RiskScorer.calculate(indicators)

        # Step 5: Format response
        return URLAnalysisResult(
            scan_id=scan_id,
            url=parsed.normalized_url,
            status="completed",
            risk_score=risk_result.score,
            risk_level=risk_result.level,
            analysis_type="rule_based",
            summary=risk_result.summary,
            features=features.to_dict(),
            indicators=[ind.to_dict() for ind in indicators],
            analyzed_at=analyzed_at,
        )


# Global singleton instance for clean reuse
default_analyzer = URLThreatAnalyzer()
