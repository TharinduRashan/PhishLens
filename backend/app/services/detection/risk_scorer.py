from dataclasses import dataclass
from typing import List, Tuple
from app.services.detection.rule_engine import RuleIndicator


class RiskScoreError(ValueError):
    """Raised when score calculation fails or parameters are invalid."""
    pass


@dataclass
class ScoredRiskResult:
    """Consolidated risk assessment metrics and summary."""
    score: int
    level: str  # "LOW", "SUSPICIOUS", "HIGH"
    summary: str
    indicator_count: int
    raw_sum: int


class RiskScorer:
    """
    Transparent, deterministic risk scoring engine.
    
    Classification Thresholds:
      0–24:   LOW
      25–59:  SUSPICIOUS
      60–100: HIGH
      
    Principles:
    - Score is strictly clamped to [0, 100].
    - Compounding dampening is applied when multiple rules trigger to avoid saturation.
    - Explicitly maintains that:
      * A LOW score does NOT prove a URL is safe or benign.
      * A HIGH score does NOT prove a URL is malicious.
    """

    LOW_THRESHOLD_MAX = 24
    SUSPICIOUS_THRESHOLD_MAX = 59
    MAX_SCORE = 100
    MIN_SCORE = 0

    @classmethod
    def calculate(cls, indicators: List[RuleIndicator]) -> ScoredRiskResult:
        if not indicators:
            return ScoredRiskResult(
                score=0,
                level="LOW",
                summary="No suspicious lexical or structural indicators were identified. (Note: A low score does not guarantee the URL is harmless).",
                indicator_count=0,
                raw_sum=0,
            )

        raw_sum = sum(ind.score for ind in indicators)

        # Dampening curve for compounding indicators:
        # If raw sum exceeds 50, apply slight diminishing returns to prevent a single category
        # from inflating without multiple distinct vectors, then cap at 100.
        if raw_sum > 60:
            # Full weight up to 60, 80% weight for remainder
            dampened = 60 + int((raw_sum - 60) * 0.85)
        else:
            dampened = raw_sum

        # Strictly clamp between MIN_SCORE and MAX_SCORE
        final_score = max(cls.MIN_SCORE, min(cls.MAX_SCORE, dampened))
        level = cls.classify(final_score)
        summary = cls._generate_summary(final_score, level, indicators)

        return ScoredRiskResult(
            score=final_score,
            level=level,
            summary=summary,
            indicator_count=len(indicators),
            raw_sum=raw_sum,
        )

    @classmethod
    def classify(cls, score: int) -> str:
        """Determines the risk category based on boundary thresholds."""
        if score <= cls.LOW_THRESHOLD_MAX:
            return "LOW"
        elif score <= cls.SUSPICIOUS_THRESHOLD_MAX:
            return "SUSPICIOUS"
        else:
            return "HIGH"

    @classmethod
    def _generate_summary(cls, score: int, level: str, indicators: List[RuleIndicator]) -> str:
        high_sev = [i.name for i in indicators if i.severity in ("high", "critical")]
        med_sev = [i.name for i in indicators if i.severity == "medium"]

        lead_factors = high_sev or med_sev or [i.name for i in indicators]
        factors_str = ", ".join(lead_factors[:2])

        if level == "HIGH":
            return (
                f"Elevated risk score ({score}/100) triggered by multiple indicators including {factors_str}. "
                "Significant phishing characteristics detected. (Note: High risk indicates strong suspicion, not definitive proof of maliciousness)."
            )
        elif level == "SUSPICIOUS":
            return (
                f"Moderate risk score ({score}/100) detected with indicators: {factors_str}. "
                "The target exhibits unusual structural or lexical attributes warranting heightened caution."
            )
        else:
            return (
                f"Low risk score ({score}/100) with minor or isolated flags ({factors_str}). "
                "No severe phishing indicators identified. (Note: A low score does not guarantee the URL is benign)."
            )
