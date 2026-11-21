import ipaddress
import re
from dataclasses import dataclass
from typing import Optional, Tuple
from urllib.parse import urlsplit, unquote


class URLValidationError(ValueError):
    """Raised when URL syntax or structure fails validation rules."""
    pass


class UnsupportedSchemeError(URLValidationError):
    """Raised when the URL scheme is not HTTP or HTTPS."""
    pass


class InvalidHostnameError(URLValidationError):
    """Raised when hostname is missing, malformed, or exceeds RFC limits."""
    pass


class InvalidPortError(URLValidationError):
    """Raised when the URL specifies an invalid port number."""
    pass


@dataclass(frozen=True)
class ParsedURLComponents:
    """Structured decomposition of a validated URL."""
    raw_url: str
    normalized_url: str
    scheme: str
    userinfo: Optional[str]
    host: str                     # Normalized hostname (IDNA / punycode representation)
    original_host: str            # Hostname before IDNA conversion
    port: Optional[int]
    path: str
    query: str
    fragment: str
    is_ipv4: bool
    is_ipv6: bool
    is_idna: bool                 # Contains punycode (starts with xn-- or non-ascii converted)
    total_length: int
    hostname_length: int


class URLParser:
    """
    Strict, deterministic, zero-network URL parser and normalizer.
    
    Guarantees:
    - Never performs DNS or network queries.
    - Accepts only HTTP and HTTPS protocols.
    - Rigorously validates ports, hostnames, and IP syntax.
    - Safely processes IDNA / punycode domains and percent-encoded sequences.
    """

    ALLOWED_SCHEMES = {"http", "https"}
    MAX_URL_LENGTH = 4096
    MAX_HOSTNAME_LENGTH = 253

    @classmethod
    def parse(cls, raw_url: str) -> ParsedURLComponents:
        if not isinstance(raw_url, str):
            raise URLValidationError("Target URL must be a string.")

        url_stripped = raw_url.strip()
        if not url_stripped:
            raise URLValidationError("Target URL cannot be empty.")

        if len(url_stripped) > cls.MAX_URL_LENGTH:
            raise URLValidationError(
                f"URL exceeds maximum supported length ({cls.MAX_URL_LENGTH} bytes)."
            )

        # Check for control characters or raw newlines
        if re.search(r"[\r\n\t]", url_stripped):
            raise URLValidationError("URL contains illegal control characters.")

        # If scheme is omitted, do NOT guess or silently convert unsupported URLs
        # Require explicit scheme matching RFC 3986
        scheme_match = re.match(r"^([a-zA-Z][a-zA-Z0-9+.-]*):", url_stripped)
        if not scheme_match:
            raise URLValidationError("URL lacks an explicit scheme (e.g. 'https://').")

        scheme = scheme_match.group(1).lower()
        if scheme not in cls.ALLOWED_SCHEMES:
            raise UnsupportedSchemeError(
                f"Unsupported URL scheme '{scheme}'. Only HTTP and HTTPS are accepted."
            )

        # Parse with urllib.parse.urlsplit
        try:
            split_res = urlsplit(url_stripped)
        except Exception as exc:
            raise URLValidationError(f"Malformed URL structure: {exc}")

        # Extract components
        userinfo = None
        netloc = split_res.netloc

        if not netloc:
            raise InvalidHostnameError("URL does not contain a valid network location (host).")

        # Check for userinfo (@ character in authority)
        if "@" in netloc:
            userinfo, netloc_host = netloc.split("@", 1)
        else:
            netloc_host = netloc

        # Parse host and port
        raw_host, port, was_bracketed_v6 = cls._extract_host_and_port(netloc_host)

        if not raw_host:
            raise InvalidHostnameError("Host component is empty.")

        # Check for illegal characters in host (colons allowed only in IPv6)
        if was_bracketed_v6:
            if re.search(r"[ /\\?#]", raw_host):
                raise InvalidHostnameError(f"IPv6 host contains invalid characters: '{raw_host}'")
        else:
            if re.search(r"[ /\\?#:]", raw_host):
                raise InvalidHostnameError(f"Host contains invalid characters: '{raw_host}'")

        # Normalize host and detect IP types
        norm_host, is_ipv4, is_ipv6, is_idna = cls._normalize_host(raw_host)

        if len(norm_host) > cls.MAX_HOSTNAME_LENGTH:
            raise InvalidHostnameError(
                f"Hostname exceeds RFC maximum length ({cls.MAX_HOSTNAME_LENGTH} characters)."
            )

        # Normalize path, query, fragment
        path = split_res.path if split_res.path else "/"
        if not path.startswith("/"):
            path = "/" + path

        query = split_res.query
        fragment = split_res.fragment

        # Build canonical normalized URL
        norm_url = f"{scheme}://"
        if userinfo:
            norm_url += f"{userinfo}@"
        if is_ipv6 and not norm_host.startswith("["):
            norm_url += f"[{norm_host}]"
        else:
            norm_url += norm_host

        if port:
            # Only include port if non-default
            if (scheme == "http" and port != 80) or (scheme == "https" and port != 443):
                norm_url += f":{port}"

        norm_url += path
        if query:
            norm_url += f"?{query}"
        if fragment:
            norm_url += f"#{fragment}"

        return ParsedURLComponents(
            raw_url=url_stripped,
            normalized_url=norm_url,
            scheme=scheme,
            userinfo=userinfo,
            host=norm_host,
            original_host=raw_host,
            port=port,
            path=path,
            query=query,
            fragment=fragment,
            is_ipv4=is_ipv4,
            is_ipv6=is_ipv6,
            is_idna=is_idna,
            total_length=len(norm_url),
            hostname_length=len(norm_host),
        )

    @classmethod
    def _extract_host_and_port(cls, netloc_host: str) -> Tuple[str, Optional[int], bool]:
        """Extract host and validate port boundaries (1 to 65535)."""
        host = netloc_host
        port: Optional[int] = None

        # Check for IPv6 bracketed address: [2001:db8::1]:8080 or [::1]
        if host.startswith("["):
            bracket_end = host.find("]")
            if bracket_end == -1:
                raise InvalidHostnameError("Unclosed IPv6 bracket in host.")
            ip_part = host[1:bracket_end]
            remainder = host[bracket_end + 1:]
            if remainder.startswith(":"):
                port_str = remainder[1:]
                port = cls._validate_port(port_str)
            elif remainder != "":
                raise InvalidHostnameError(f"Unexpected trailing characters after IPv6: '{remainder}'")
            return ip_part, port, True

        # IPv4 or standard domain name with possible :port
        if ":" in host:
            parts = host.split(":")
            if len(parts) > 2:
                # Could be unbracketed IPv6 - reject as malformed
                raise InvalidHostnameError("IPv6 addresses in URLs must be enclosed in square brackets '[...]'.")
            host_str, port_str = parts
            port = cls._validate_port(port_str)
            return host_str, port, False

        return host, None, False

    @classmethod
    def _validate_port(cls, port_str: str) -> int:
        """Validates that port string is a valid integer in [1, 65535]."""
        if not port_str:
            raise InvalidPortError("Empty port specification after colon.")
        if not port_str.isdigit():
            raise InvalidPortError(f"Port '{port_str}' is non-numeric.")
        port_num = int(port_str)
        if port_num < 1 or port_num > 65535:
            raise InvalidPortError(f"Port number {port_num} is out of valid range (1–65535).")
        return port_num

    @classmethod
    def _normalize_host(cls, raw_host: str) -> Tuple[str, bool, bool, bool]:
        """
        Normalizes host string:
        - Detects IPv4 / IPv6
        - Performs IDNA encoding for Unicode hostnames
        - Detects punycode presence
        """
        # 1. Try IPv4
        try:
            ip_obj = ipaddress.IPv4Address(raw_host)
            return str(ip_obj), True, False, False
        except ValueError:
            pass

        # 2. Try IPv6
        clean_v6 = raw_host.strip("[]")
        try:
            ip_obj = ipaddress.IPv6Address(clean_v6)
            return str(ip_obj), False, True, False
        except ValueError:
            pass

        # 3. Domain Name: IDNA Normalization
        host_lower = raw_host.lower()
        is_idna = False

        if "xn--" in host_lower:
            is_idna = True

        try:
            # Encode to IDNA ASCII (converts unicode to punycode)
            idna_encoded = host_lower.encode("idna").decode("ascii")
            if idna_encoded != host_lower and "xn--" in idna_encoded:
                is_idna = True
            norm_host = idna_encoded
        except UnicodeError as uerr:
            raise InvalidHostnameError(f"Host fails IDNA / Unicode normalization: {uerr}")

        # Basic domain label validation
        labels = norm_host.split(".")
        for label in labels:
            if not label:
                # Allowed only for trailing dot, e.g., 'example.com.'
                continue
            if len(label) > 63:
                raise InvalidHostnameError(f"Domain label exceeds RFC 1035 max length: '{label}'")
            if label.startswith("-") or label.endswith("-"):
                raise InvalidHostnameError(f"Domain label cannot start or end with hyphen: '{label}'")

        return norm_host, False, False, is_idna
