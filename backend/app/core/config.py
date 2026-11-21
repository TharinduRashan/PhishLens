import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """PhishLens Application Configuration."""

    PROJECT_NAME: str = "PhishLens API"
    API_V1_STR: str = "/api/v1"
    TAGLINE: str = "See the threat behind the link."
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database settings
    # Defaults to SQLite for local development so it runs without an active Postgres instance
    DATABASE_URL: str = "sqlite:///./phishlens.db"
    POSTGRES_USER: str = "phishlens"
    POSTGRES_PASSWORD: str = "phishlens"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "phishlens"

    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    # Security & SSRF Protection
    BLOCKED_IP_RANGES: List[str] = [
        "127.0.0.0/8",      # Loopback
        "10.0.0.0/8",       # Private-use networks
        "172.16.0.0/12",    # Private-use networks
        "192.168.0.0/16",   # Private-use networks
        "169.254.0.0/16",   # Link local / Cloud metadata
        "::1/128",          # IPv6 loopback
        "fc00::/7",         # IPv6 private
        "fe80::/10",        # IPv6 link-local
    ]
    ALLOWED_SCHEMES: List[str] = ["http", "https"]

    # Phase 1 Execution Status
    ENGINE_STATUS: str = "engine_pending"
    PHASE_NAME: str = "Phase 1: Project Foundation"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
