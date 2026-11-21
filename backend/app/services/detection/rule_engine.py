from dataclasses import dataclass
from typing import Dict, List, Optional
from app.services.detection.feature_extractor import URLFeatures
from app.services.detection.url_parser import ParsedURLComponents


@dataclass
class RuleIndicator:
    """Individual rule evaluation finding."""
    rule_id: str
    name: str
    severity: str        # "low", "medium", "high", "critical"
    description: str
    score: int           # Score contribution
    evidence: str        # Contextual proof or parameter value

    def to_dict(self) -> dict:
        return {
            "rule_id": self.rule_id,
            "name": self.name,
            "severity": self.severity,
            "description": self.description,
            "score": self.score,
            "evidence": self.evidence,
        }


# Default Configurable Rule Weights
DEFAULT_RULE_WEIGHTS: Dict[str, int] = {
    "URL_001": 25,  # IP Address Host
    "URL_002": 25,  # @ Character Obfuscation
    "URL_003": 15,  # Punycode / IDN Host
    "URL_004": 10,  # Excessive Total URL Length
    "URL_005": 15,  # Excessive Hostname Length / Subdomains
    "URL_006": 15,  # Multiple Hostname Hyphens
    "URL_007": 20,  # Suspicious Keywords in Hostname
    "URL_008": 5,   # Suspicious Keywords in Path/Query
    "URL_009": 25,  # Suspicious Brand in Hostname
    "URL_010": 10,  # URL Shortener
    "URL_011": 10,  # Insecure HTTP
    "URL_012": 15,  # Non-Standard Port
    "URL_013": 10,  # Excessive Percent-Encoding
    "URL_014": 10,  # High Special Character Count
}


class RuleEngine:
    """
    Evaluates extracted URL features against deterministic, transparent threat heuristics.
    
    Features:
    - Independent detection rules with unique IDs.
    - Configurable severity and score contributions.
    - Dampening / deduplication to prevent runaway double-counting of related indicators.
    """

    def __init__(self, weights: Optional[Dict[str, int]] = None):
        self.weights = {**DEFAULT_RULE_WEIGHTS, **(weights or {})}

    def evaluate(self, parsed: ParsedURLComponents, features: URLFeatures) -> List[RuleIndicator]:
        indicators: List[RuleIndicator] = []

        # -------------------------------------------------------------
        # Rule 1: IP Address Host
        # -------------------------------------------------------------
        if features.is_ip_address:
            indicators.append(
                RuleIndicator(
                    rule_id="URL_001",
                    name="IP Address Host",
                    severity="high",
                    description="The URL uses a raw IP address instead of a registered domain name.",
                    score=self.weights.get("URL_001", 25),
                    evidence=f"Host resolved directly as IP: {parsed.host}",
                )
            )

        # -------------------------------------------------------------
        # Rule 2: Userinfo @ Character Obfuscation
        # -------------------------------------------------------------
        if features.has_at_symbol:
            indicators.append(
                RuleIndicator(
                    rule_id="URL_002",
                    name="@ Character Authority Obfuscation",
                    severity="high",
                    description="The URL contains an '@' character before the host, which can deceive users regarding the actual destination host.",
                    score=self.weights.get("URL_002", 25),
                    evidence=f"Userinfo component detected: {parsed.userinfo or '@ character present'}",
                )
            )

        # -------------------------------------------------------------
        # Rule 3: Punycode / IDN Hostname
        # -------------------------------------------------------------
        if features.has_punycode:
            indicators.append(
                RuleIndicator(
                    rule_id="URL_003",
                    name="Punycode / IDN Hostname",
                    severity="medium",
                    description="The hostname uses Punycode (IDN encoding), frequently associated with lookalike character spoofing.",
                    score=self.weights.get("URL_003", 15),
                    evidence=f"IDNA Host: {parsed.host} (original: {parsed.original_host})",
                )
            )

        # -------------------------------------------------------------
        # Rule 4: Excessive URL Length
        # -------------------------------------------------------------
        if features.url_length > 100:
            score = self.weights.get("URL_004", 10)
            if features.url_length > 160:
                score += 5
            indicators.append(
                RuleIndicator(
                    rule_id="URL_004",
                    name="Excessive URL Length",
                    severity="medium" if features.url_length > 160 else "low",
                    description="The total URL length exceeds standard web conventions (>100 characters), typical of obfuscated link payloads.",
                    score=score,
                    evidence=f"URL Length: {features.url_length} characters",
                )
            )

        # -------------------------------------------------------------
        # Rule 5: Excessive Hostname Length & Subdomain Depth
        # -------------------------------------------------------------
        if features.hostname_length > 35 or features.num_subdomains >= 3:
            indicators.append(
                RuleIndicator(
                    rule_id="URL_005",
                    name="Abnormal Hostname Depth",
                    severity="medium",
                    description="The hostname is unusually long or contains multiple nested subdomains, which may obscure the true registered domain.",
                    score=self.weights.get("URL_005", 15),
                    evidence=f"Host Length: {features.hostname_length} chars, Subdomains: {features.num_subdomains} ({', '.join(features.subdomain_labels)})",
                )
            )

        # -------------------------------------------------------------
        # Rule 6: Multiple Hostname Hyphens
        # -------------------------------------------------------------
        if features.hostname_hyphens >= 2:
            score = self.weights.get("URL_006", 15)
            if features.hostname_hyphens >= 4:
                score += 5
            indicators.append(
                RuleIndicator(
                    rule_id="URL_006",
                    name="Multiple Hostname Hyphens",
                    severity="medium",
                    description="The hostname contains multiple hyphens, a technique frequently used to simulate official domain combinations.",
                    score=score,
                    evidence=f"Hyphen count in host: {features.hostname_hyphens}",
                )
            )

        # -------------------------------------------------------------
        # Rule 7: Suspicious Keywords in Hostname
        # -------------------------------------------------------------
        if features.suspicious_keywords.in_hostname:
            matched = features.suspicious_keywords.in_hostname
            indicators.append(
                RuleIndicator(
                    rule_id="URL_007",
                    name="Suspicious Security Keywords in Hostname",
                    severity="high",
                    description="High-risk security or authentication keywords are embedded directly within the domain name labels.",
                    score=self.weights.get("URL_007", 20),
                    evidence=f"Matched keywords in hostname: {', '.join(matched)}",
                )
            )
        # -------------------------------------------------------------
        # Rule 8: Suspicious Keywords in Path/Query (Only if not in host, avoids duplicate inflation)
        # -------------------------------------------------------------
        elif features.suspicious_keywords.in_path or features.suspicious_keywords.in_query:
            matched_items = features.suspicious_keywords.in_path + features.suspicious_keywords.in_query
            indicators.append(
                RuleIndicator(
                    rule_id="URL_008",
                    name="Authentication Keywords in Path or Parameters",
                    severity="low",
                    description="Authentication or account management keywords were observed in the URL path or query string.",
                    score=self.weights.get("URL_008", 5),
                    evidence=f"Matched path/query keywords: {', '.join(matched_items[:5])}",
                )
            )

        # -------------------------------------------------------------
        # Rule 9: Suspicious Brand Targeting in Hostname
        # -------------------------------------------------------------
        if features.suspicious_brand_keywords.in_hostname:
            matched_brands = features.suspicious_brand_keywords.in_hostname
            indicators.append(
                RuleIndicator(
                    rule_id="URL_009",
                    name="Brand Keyword in Hostname",
                    severity="high",
                    description="A recognized global brand name is present in the domain name. Note: Simple substring match is a heuristic, not proof of spoofing.",
                    score=self.weights.get("URL_009", 25),
                    evidence=f"Brand tokens detected: {', '.join(matched_brands)}",
                )
            )

        # -------------------------------------------------------------
        # Rule 10: URL Shortener Service
        # -------------------------------------------------------------
        if features.is_shortened_url:
            indicators.append(
                RuleIndicator(
                    rule_id="URL_010",
                    name="URL Shortening Service",
                    severity="low",
                    description="The URL uses a known link shortener, masking the eventual landing page destination.",
                    score=self.weights.get("URL_010", 10),
                    evidence=f"Shortener domain: {parsed.host}",
                )
            )

        # -------------------------------------------------------------
        # Rule 11: Insecure Plain HTTP Protocol
        # -------------------------------------------------------------
        if not features.is_https:
            indicators.append(
                RuleIndicator(
                    rule_id="URL_011",
                    name="Unencrypted HTTP Transport",
                    severity="low",
                    description="The connection uses plain unencrypted HTTP without TLS encryption, vulnerable to interception.",
                    score=self.weights.get("URL_011", 10),
                    evidence="Scheme: http",
                )
            )

        # -------------------------------------------------------------
        # Rule 12: Non-Standard Web Port
        # -------------------------------------------------------------
        if features.has_unusual_port:
            indicators.append(
                RuleIndicator(
                    rule_id="URL_012",
                    name="Non-Standard Network Port",
                    severity="medium",
                    description="The URL explicitly targets an uncommon network port rather than standard HTTP (80) or HTTPS (443).",
                    score=self.weights.get("URL_012", 15),
                    evidence=f"Specified Port: {parsed.port}",
                )
            )

        # -------------------------------------------------------------
        # Rule 13: Excessive Percent-Encoding
        # -------------------------------------------------------------
        if features.num_percent_encoded >= 3:
            indicators.append(
                RuleIndicator(
                    rule_id="URL_013",
                    name="High Percent-Encoding Concentration",
                    severity="medium",
                    description="The URL contains multiple percent-encoded characters (%xx), often used to evade string filters.",
                    score=self.weights.get("URL_013", 10),
                    evidence=f"Percent-encoded sequences: {features.num_percent_encoded}",
                )
            )

        # -------------------------------------------------------------
        # Rule 14: High Special Character Density
        # -------------------------------------------------------------
        if features.num_special_characters >= 8:
            indicators.append(
                RuleIndicator(
                    rule_id="URL_014",
                    name="Elevated Special Character Count",
                    severity="low",
                    description="The URL exhibits an unusually high count of delimiter and special characters.",
                    score=self.weights.get("URL_014", 10),
                    evidence=f"Special character count: {features.num_special_characters}",
                )
            )

        return indicators
