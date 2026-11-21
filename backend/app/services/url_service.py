import logging
from typing import Dict, Any
from app.core.security import sanitize_for_logging
from app.services.detection.analyzer import default_analyzer, URLAnalysisResult

logger = logging.getLogger("phishlens.services.url")


class URLInspectionService:
    """
    Service adapter for the Phase 2 deterministic URL threat detection engine.
    """

    @staticmethod
    def process_url_submission(raw_url: str, deep_analysis: bool = False) -> Dict[str, Any]:
        safe_log = sanitize_for_logging(raw_url)
        logger.info(f"URL analysis request received: {safe_log}")

        # Run offline deterministic analysis
        result: URLAnalysisResult = default_analyzer.analyze(raw_url)
        logger.info(
            f"URL analysis complete: scan_id={result.scan_id} score={result.risk_score} level={result.risk_level}"
        )
        return result.to_dict()
