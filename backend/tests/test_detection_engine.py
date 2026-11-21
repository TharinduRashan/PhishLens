import pytest
import socket
import urllib.request
from app.services.detection.url_parser import (
    URLParser,
    URLValidationError,
    UnsupportedSchemeError,
    InvalidHostnameError,
    InvalidPortError,
)
from app.services.detection.feature_extractor import FeatureExtractor
from app.services.detection.rule_engine import RuleEngine
from app.services.detection.risk_scorer import RiskScorer
from app.services.detection.analyzer import URLThreatAnalyzer, default_analyzer


# =====================================================================
# 1. Zero-Network Guarantee Test
# =====================================================================
def test_zero_network_request_guarantee(monkeypatch):
    """
    Strict proof that the detection engine never makes network requests,
    never issues DNS lookups, and operates 100% offline.
    """
    def forbidden_network_call(*args, **kwargs):
        raise AssertionError("CRITICAL VIOLATION: Network or DNS lookup attempted by detection engine!")

    # Intercept raw socket and DNS calls
    monkeypatch.setattr(socket, "socket", forbidden_network_call)
    monkeypatch.setattr(socket, "gethostbyname", forbidden_network_call)
    monkeypatch.setattr(socket, "getaddrinfo", forbidden_network_call)
    monkeypatch.setattr(socket, "create_connection", forbidden_network_call)
    monkeypatch.setattr(urllib.request, "urlopen", forbidden_network_call)

    analyzer = URLThreatAnalyzer()
    
    test_urls = [
        "https://example.com/normal-path",
        "http://192.0.2.1/login",
        "https://user:pass@evil-host.com/path",
        "https://paypa1-security-verification.top/signin?token=123",
        "http://bit.ly/3x8QzL",
        "https://xn--e1afmkfd.xn--p1ai/test",
    ]

    for url in test_urls:
        result = analyzer.analyze(url)
        assert result.status == "completed"
        assert result.risk_level in ("LOW", "SUSPICIOUS", "HIGH")


# =====================================================================
# 2. URL Parsing & Normalization Tests
# =====================================================================
def test_parse_normal_https_url():
    parsed = URLParser.parse("https://www.example.com/path/to/resource?query=1#frag")
    assert parsed.scheme == "https"
    assert parsed.host == "www.example.com"
    assert parsed.path == "/path/to/resource"
    assert parsed.query == "query=1"
    assert parsed.port is None
    assert not parsed.is_ipv4
    assert not parsed.is_ipv6
    assert not parsed.is_idna


def test_parse_http_url():
    parsed = URLParser.parse("http://example.org/test")
    assert parsed.scheme == "http"
    assert parsed.host == "example.org"


def test_parse_ip_based_urls():
    # IPv4
    parsed_v4 = URLParser.parse("http://192.168.1.100/admin")
    assert parsed_v4.is_ipv4
    assert parsed_v4.host == "192.168.1.100"

    # IPv6 with port
    parsed_v6 = URLParser.parse("https://[2001:db8::1]:8443/api")
    assert parsed_v6.is_ipv6
    assert parsed_v6.host == "2001:db8::1"
    assert parsed_v6.port == 8443


def test_parse_unsupported_schemes():
    with pytest.raises(UnsupportedSchemeError):
        URLParser.parse("ftp://example.com/files")

    with pytest.raises(UnsupportedSchemeError):
        URLParser.parse("file:///etc/passwd")

    with pytest.raises(UnsupportedSchemeError):
        URLParser.parse("javascript:alert(1)")


def test_parse_invalid_ports():
    with pytest.raises(InvalidPortError):
        URLParser.parse("http://example.com:99999/path")

    with pytest.raises(InvalidPortError):
        URLParser.parse("http://example.com:0/path")

    with pytest.raises(InvalidPortError):
        URLParser.parse("http://example.com:invalid/path")


def test_parse_empty_and_malformed_urls():
    with pytest.raises(URLValidationError):
        URLParser.parse("")

    with pytest.raises(URLValidationError):
        URLParser.parse("   ")

    with pytest.raises(URLValidationError):
        URLParser.parse("not-a-valid-url")

    with pytest.raises(InvalidHostnameError):
        URLParser.parse("https://")


def test_parse_punycode_and_unicode_domains():
    # ASCII Punycode
    parsed_puny = URLParser.parse("https://xn--pple-43d.com")
    assert parsed_puny.is_idna
    assert "xn--" in parsed_puny.host

    # Direct Unicode ( Cyrillic а in place of latin a)
    parsed_unicode = URLParser.parse("https://рaypal.com")
    assert parsed_unicode.is_idna
    assert parsed_unicode.host.startswith("xn--")


def test_parse_userinfo_at_symbol():
    parsed = URLParser.parse("https://trusted-bank.com@evil-destination.com/login")
    assert parsed.userinfo == "trusted-bank.com"
    assert parsed.host == "evil-destination.com"


# =====================================================================
# 3. Feature Extraction Tests
# =====================================================================
def test_feature_extractor_distinguishes_host_path_query():
    # Keyword 'login' in host vs path vs query
    parsed_host = URLParser.parse("https://login-service.example.com")
    feat_host = FeatureExtractor.extract(parsed_host)
    assert "login" in feat_host.suspicious_keywords.in_hostname
    assert "login" not in feat_host.suspicious_keywords.in_path

    parsed_path = URLParser.parse("https://example.com/login/auth")
    feat_path = FeatureExtractor.extract(parsed_path)
    assert "login" in feat_path.suspicious_keywords.in_path
    assert "login" not in feat_path.suspicious_keywords.in_hostname

    parsed_query = URLParser.parse("https://example.com/checkout?action=verify")
    feat_query = FeatureExtractor.extract(parsed_query)
    assert "verify" in feat_query.suspicious_keywords.in_query


def test_feature_extractor_url_shorteners():
    parsed = URLParser.parse("https://bit.ly/sample-link")
    feat = FeatureExtractor.extract(parsed)
    assert feat.is_shortened_url is True

    parsed_normal = URLParser.parse("https://example.com/article")
    feat_normal = FeatureExtractor.extract(parsed_normal)
    assert feat_normal.is_shortened_url is False


def test_feature_extractor_percent_and_special_chars():
    parsed = URLParser.parse("https://example.com/search?q=%20%2F%3A%26&category=1!~+")
    feat = FeatureExtractor.extract(parsed)
    assert feat.num_percent_encoded >= 4
    assert feat.num_special_characters >= 6


# =====================================================================
# 4. Rule Engine Tests
# =====================================================================
def test_rule_engine_ip_rule():
    parsed = URLParser.parse("http://203.0.113.15/update")
    features = FeatureExtractor.extract(parsed)
    engine = RuleEngine()
    indicators = engine.evaluate(parsed, features)
    rule_ids = [i.rule_id for i in indicators]
    assert "URL_001" in rule_ids  # IP Address Host
    assert "URL_011" in rule_ids  # Insecure HTTP


def test_rule_engine_at_symbol_rule():
    parsed = URLParser.parse("https://google.com@attacker.com/session")
    features = FeatureExtractor.extract(parsed)
    engine = RuleEngine()
    indicators = engine.evaluate(parsed, features)
    rule_ids = [i.rule_id for i in indicators]
    assert "URL_002" in rule_ids


def test_rule_engine_brand_in_hostname():
    parsed = URLParser.parse("https://paypal-verify-account-security.com")
    features = FeatureExtractor.extract(parsed)
    engine = RuleEngine()
    indicators = engine.evaluate(parsed, features)
    rule_ids = [i.rule_id for i in indicators]
    assert "URL_009" in rule_ids  # Brand keyword in hostname
    assert "URL_007" in rule_ids  # Suspicious security keywords in hostname
    assert "URL_006" in rule_ids  # Multiple hyphens


# =====================================================================
# 5. Risk Scorer Boundary Tests
# =====================================================================
def test_risk_scorer_boundaries():
    # Boundary 0: LOW
    assert RiskScorer.classify(0) == "LOW"
    # Boundary 24: LOW
    assert RiskScorer.classify(24) == "LOW"
    # Boundary 25: SUSPICIOUS
    assert RiskScorer.classify(25) == "SUSPICIOUS"
    # Boundary 59: SUSPICIOUS
    assert RiskScorer.classify(59) == "SUSPICIOUS"
    # Boundary 60: HIGH
    assert RiskScorer.classify(60) == "HIGH"
    # Boundary 100: HIGH
    assert RiskScorer.classify(100) == "HIGH"


def test_risk_scorer_clamping_and_capping():
    # Clean indicators empty
    clean_result = RiskScorer.calculate([])
    assert clean_result.score == 0
    assert clean_result.level == "LOW"

    # Extreme cumulative rules
    from app.services.detection.rule_engine import RuleIndicator
    heavy_indicators = [
        RuleIndicator("URL_001", "IP Host", "high", "desc", 25, "ev"),
        RuleIndicator("URL_002", "@ Obfuscation", "high", "desc", 25, "ev"),
        RuleIndicator("URL_007", "Keywords Host", "high", "desc", 20, "ev"),
        RuleIndicator("URL_009", "Brand Host", "high", "desc", 25, "ev"),
        RuleIndicator("URL_006", "Hyphens", "medium", "desc", 15, "ev"),
        RuleIndicator("URL_003", "Punycode", "medium", "desc", 15, "ev"),
    ]
    heavy_result = RiskScorer.calculate(heavy_indicators)
    assert heavy_result.score <= 100
    assert heavy_result.level == "HIGH"


# =====================================================================
# 6. End-to-End URL Threat Analyzer Integration
# =====================================================================
def test_analyzer_clean_url():
    res = default_analyzer.analyze("https://github.com/explore")
    assert res.status == "completed"
    assert res.risk_score <= 24
    assert res.risk_level == "LOW"
    assert res.analysis_type == "rule_based"
    assert "features" in res.to_dict()
    assert "indicators" in res.to_dict()


def test_analyzer_high_risk_phishing_url():
    res = default_analyzer.analyze("http://paypa1-security-verification-account-auth.top:8080/signin?id=123")
    assert res.status == "completed"
    assert res.risk_score >= 60
    assert res.risk_level == "HIGH"
    assert len(res.indicators) >= 3


def test_analyzer_suspicious_url():
    res = default_analyzer.analyze("https://bit.ly/3x9YzL")
    assert res.status == "completed"
    assert res.risk_level in ("LOW", "SUSPICIOUS")
