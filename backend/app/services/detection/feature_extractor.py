import re
from dataclasses import dataclass, field
from typing import Dict, List, Set
from app.services.detection.url_parser import ParsedURLComponents


# Documented Suspicious Keywords
# Categorized by intent to enable granular context analysis
SUSPICIOUS_KEYWORDS: Dict[str, Set[str]] = {
    "auth": {
        "login", "signin", "sign-in", "logon", "auth", "authenticate",
        "sso", "oauth", "credential", "password", "pwd",
    },
    "account": {
        "verify", "verification", "account", "security", "secure",
        "update", "profile", "confirm", "confirmation", "recovery",
        "recover", "unlock", "lockout", "suspended", "restricted",
    },
    "finance": {
        "banking", "bank", "billing", "invoice", "payment",
        "wallet", "checkout", "wire", "transfer", "transaction",
    },
    "action": {
        "alert", "notify", "notice", "support", "helpdesk", "portal", "admin",
    },
}

ALL_SUSPICIOUS_KEYWORDS: Set[str] = set().union(*SUSPICIOUS_KEYWORDS.values())

# Documented Popular Brand Keywords Commonly Targeted in Phishing
# Disclaimer: Simple substring matching is an exploratory heuristic indicator,
# not proof of true brand impersonation.
POPULAR_BRANDS: Set[str] = {
    "paypal", "apple", "microsoft", "google", "netflix", "amazon",
    "facebook", "instagram", "whatsapp", "chase", "wellsfargo",
    "bankofamerica", "citibank", "binance", "coinbase", "metamask",
    "dhl", "fedex", "usps", "dropbox", "adobe", "office365", "outlook",
}

# Known URL Shortener Domains
KNOWN_URL_SHORTENERS: Set[str] = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly",
    "rebrand.ly", "cutt.ly", "shorturl.at", "tiny.cc", "goo.gl",
    "qr.ae", "rb.gy", "lnkd.in", "s.id", "t.ly",
}

# Standard web ports
STANDARD_PORTS = {80, 443}


@dataclass
class KeywordOccurrences:
    """Breakdown of keyword occurrences across URL components."""
    in_hostname: List[str] = field(default_factory=list)
    in_path: List[str] = field(default_factory=list)
    in_query: List[str] = field(default_factory=list)

    @property
    def total_count(self) -> int:
        return len(self.in_hostname) + len(self.in_path) + len(self.in_query)


@dataclass
class URLFeatures:
    """Structured extraction of lexical, structural, and syntactic URL features."""
    url_length: int
    hostname_length: int
    num_subdomains: int
    is_ip_address: bool
    is_https: bool
    has_at_symbol: bool
    suspicious_keywords: KeywordOccurrences
    is_shortened_url: bool
    has_punycode: bool
    num_special_characters: int
    num_percent_encoded: int
    has_unusual_port: bool
    hostname_hyphens: int
    suspicious_brand_keywords: KeywordOccurrences
    # Granular telemetry helpers
    subdomain_labels: List[str] = field(default_factory=list)
    port: int = 0
    special_characters_breakdown: Dict[str, int] = field(default_factory=dict)

    def to_dict(self) -> dict:
        """Converts features to a JSON-serializable dictionary."""
        return {
            "url_length": self.url_length,
            "hostname_length": self.hostname_length,
            "num_subdomains": self.num_subdomains,
            "is_ip_address": self.is_ip_address,
            "is_https": self.is_https,
            "has_at_symbol": self.has_at_symbol,
            "suspicious_keywords": {
                "in_hostname": self.suspicious_keywords.in_hostname,
                "in_path": self.suspicious_keywords.in_path,
                "in_query": self.suspicious_keywords.in_query,
                "total": self.suspicious_keywords.total_count,
            },
            "is_shortened_url": self.is_shortened_url,
            "has_punycode": self.has_punycode,
            "num_special_characters": self.num_special_characters,
            "num_percent_encoded": self.num_percent_encoded,
            "has_unusual_port": self.has_unusual_port,
            "hostname_hyphens": self.hostname_hyphens,
            "suspicious_brand_keywords": {
                "in_hostname": self.suspicious_brand_keywords.in_hostname,
                "in_path": self.suspicious_brand_keywords.in_path,
                "in_query": self.suspicious_brand_keywords.in_query,
                "total": self.suspicious_brand_keywords.total_count,
            },
        }


class FeatureExtractor:
    """Deterministic, zero-network feature extraction engine."""

    # Special characters to measure
    SPECIAL_CHARS = set("-_.@?=&%!~+$*,;:()")

    @classmethod
    def extract(cls, parsed: ParsedURLComponents) -> URLFeatures:
        # 1. Lengths
        url_len = parsed.total_length
        host_len = parsed.hostname_length

        # 2. IP Host
        is_ip = parsed.is_ipv4 or parsed.is_ipv6

        # 3. Subdomains calculation
        subdomains, subdomain_labels = cls._extract_subdomains(parsed.host, is_ip)

        # 4. HTTPS usage
        is_https = parsed.scheme.lower() == "https"

        # 5. @ character presence (in userinfo or authority)
        has_at = bool(parsed.userinfo) or ("@" in parsed.raw_url)

        # 6. Keywords analysis: distinguish hostname, path, and query
        suspicious_kw = cls._find_keywords(parsed, ALL_SUSPICIOUS_KEYWORDS)

        # 7. Brand keywords analysis
        brand_kw = cls._find_keywords(parsed, POPULAR_BRANDS)

        # 8. Shortened URL detection
        is_shortened = cls._check_url_shortener(parsed.host)

        # 9. Punycode detection
        has_punycode = parsed.is_idna or ("xn--" in parsed.host.lower())

        # 10. Special characters count and breakdown
        spec_count, spec_breakdown = cls._count_special_characters(parsed.raw_url)

        # 11. Percent-encoded sequences (%xx)
        percent_count = len(re.findall(r"%[0-9a-fA-F]{2}", parsed.raw_url))

        # 12. Unusual port
        has_unusual_port = False
        port_num = parsed.port or (443 if is_https else 80)
        if parsed.port and parsed.port not in STANDARD_PORTS:
            has_unusual_port = True

        # 13. Hyphens in hostname
        host_hyphens = parsed.host.count("-")

        return URLFeatures(
            url_length=url_len,
            hostname_length=host_len,
            num_subdomains=subdomains,
            is_ip_address=is_ip,
            is_https=is_https,
            has_at_symbol=has_at,
            suspicious_keywords=suspicious_kw,
            is_shortened_url=is_shortened,
            has_punycode=has_punycode,
            num_special_characters=spec_count,
            num_percent_encoded=percent_count,
            has_unusual_port=has_unusual_port,
            hostname_hyphens=host_hyphens,
            suspicious_brand_keywords=brand_kw,
            subdomain_labels=subdomain_labels,
            port=port_num,
            special_characters_breakdown=spec_breakdown,
        )

    @classmethod
    def _extract_subdomains(cls, host: str, is_ip: bool) -> Tuple[int, List[str]]:
        if is_ip:
            return 0, []

        labels = [l for l in host.split(".") if l]
        if len(labels) <= 2:
            return 0, []

        # Simple 2-level TLD heuristic (e.g. .co.uk, .com.au)
        common_two_level = {"co.uk", "com.au", "co.nz", "com.br", "co.jp", "gov.uk", "org.uk"}
        if len(labels) >= 3 and f"{labels[-2]}.{labels[-1]}".lower() in common_two_level:
            subdomain_parts = labels[:-3]
        else:
            subdomain_parts = labels[:-2]

        return len(subdomain_parts), subdomain_parts

    @classmethod
    def _find_keywords(
        cls, parsed: ParsedURLComponents, target_words: Set[str]
    ) -> KeywordOccurrences:
        """
        Locates target keywords across distinct URL sections:
        - Hostname labels (highest threat weight)
        - Path segments
        - Query string values
        """
        # Tokenize hostname by dots, hyphens, and underscores
        host_tokens = set(re.split(r"[\.\-_]", parsed.host.lower()))
        # Tokenize path by slashes, hyphens, underscores, dots
        path_tokens = set(re.split(r"[/._\-]", parsed.path.lower()))
        # Tokenize query string
        query_tokens = set(re.split(r"[=&._\-+]", parsed.query.lower()))

        in_host = sorted([w for w in target_words if w in host_tokens or any(w in label for label in host_tokens if len(label) > len(w))])
        in_path = sorted([w for w in target_words if w in path_tokens and w not in in_host])
        in_query = sorted([w for w in target_words if w in query_tokens and w not in in_host and w not in in_path])

        return KeywordOccurrences(
            in_hostname=in_host,
            in_path=in_path,
            in_query=in_query,
        )

    @classmethod
    def _check_url_shortener(cls, host: str) -> bool:
        host_clean = host.lower()
        if host_clean in KNOWN_URL_SHORTENERS:
            return True
        for shortener in KNOWN_URL_SHORTENERS:
            if host_clean.endswith(f".{shortener}"):
                return True
        return False

    @classmethod
    def _count_special_characters(cls, raw_url: str) -> Tuple[int, Dict[str, int]]:
        breakdown: Dict[str, int] = {}
        total = 0
        for char in raw_url:
            if char in cls.SPECIAL_CHARS:
                total += 1
                breakdown[char] = breakdown.get(char, 0) + 1
        return total, breakdown
