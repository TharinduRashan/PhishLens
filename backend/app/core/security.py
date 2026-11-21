import hashlib
import ipaddress
import re
import socket
from urllib.parse import urlparse
from typing import Tuple
from app.core.config import settings


class SecurityError(Exception):
    """Base exception for security validation errors."""
    pass


class SSRFProtectionError(SecurityError):
    """Raised when an address violates SSRF protection boundaries."""
    pass


class InvalidURLError(SecurityError):
    """Raised when a URL is structurally invalid or uses an unauthorized protocol."""
    pass


def sanitize_for_logging(text: str, max_preview: int = 40) -> str:
    """
    Produce a privacy-preserving summary and sha256 hash for logging.
    Never prints full sensitive payloads or credentials to server logs.
    """
    if not text:
        return "[empty]"
    sha = hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()[:12]
    clean_preview = re.sub(r"[^\w\s\.-]", "", text[:max_preview]).strip()
    return f"preview='{clean_preview}...' hash={sha} length={len(text)}"


def validate_and_normalize_url(raw_url: str) -> Tuple[str, str]:
    """
    Validates and normalizes user-provided URLs while guarding against SSRF and protocol exploits.
    
    Returns:
        Tuple of (normalized_url, hostname)
    
    Security Controls:
    1. Only http and https schemes are accepted.
    2. Disallows file://, gopher://, ftp://, ldap://, dict://, javascript:, data:.
    3. Blocks localhost, 127.0.0.1, internal RFC 1918 addresses, and link-local cloud metadata (169.254.169.254).
    4. Never performs an outbound HTTP fetch to the destination.
    """
    url_trimmed = raw_url.strip()
    if not url_trimmed:
        raise InvalidURLError("URL target cannot be empty.")

    # Auto-prefix http:// if missing scheme for parsing safety
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", url_trimmed):
        url_trimmed = f"https://{url_trimmed}"

    parsed = urlparse(url_trimmed)

    # 1. Scheme verification
    scheme = (parsed.scheme or "").lower()
    if scheme not in settings.ALLOWED_SCHEMES:
        raise InvalidURLError(
            f"Invalid URL scheme '{scheme}'. Only HTTP and HTTPS protocols are accepted."
        )

    # 2. Hostname extraction
    hostname = (parsed.hostname or "").lower().strip()
    if not hostname:
        raise InvalidURLError("URL does not contain a valid domain or host.")

    # 3. Direct blocked hostnames
    blocked_hosts = {"localhost", "localhost.localdomain", "broadcasthost", "0.0.0.0"}
    if hostname in blocked_hosts or hostname.endswith(".local") or hostname.endswith(".internal"):
        raise SSRFProtectionError(f"Target host '{hostname}' is an internal or local reserved host.")

    # 4. Check if hostname is an IP address
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_loopback:
            raise SSRFProtectionError(f"Loopback IP addresses ({hostname}) are not permitted.")
        if ip.is_private:
            raise SSRFProtectionError(f"Private network IP addresses ({hostname}) are not permitted.")
        if ip.is_link_local:
            raise SSRFProtectionError(f"Link-local addresses ({hostname}) are not permitted.")
        if ip.is_multicast:
            raise SSRFProtectionError(f"Multicast IP addresses ({hostname}) are not permitted.")
        if ip.is_reserved:
            raise SSRFProtectionError(f"Reserved IP addresses ({hostname}) are not permitted.")
    except ValueError:
        # Not an IP string, hostname is domain name (e.g. google.com)
        pass

    # Normalized clean URL
    normalized_path = parsed.path if parsed.path else "/"
    normalized = f"{scheme}://{hostname}"
    if parsed.port and (
        (scheme == "http" and parsed.port != 80) or 
        (scheme == "https" and parsed.port != 443)
    ):
        normalized += f":{parsed.port}"
    normalized += normalized_path
    if parsed.query:
        normalized += f"?{parsed.query}"

    return normalized, hostname
