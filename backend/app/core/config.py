import os
from functools import lru_cache
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


class Settings:
    """Application settings loaded from environment variables."""

    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "AI Fake News Detection System")
    API_VERSION: str = os.getenv("API_VERSION", "1.0.0")
    API_PREFIX: str = os.getenv("API_PREFIX", "/api").rstrip("/")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fake_news.db")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173 , https://ai-news-detector-l044z1u8z-sadan-01s-projects.vercel.app,https://ai-news-detector.vercel.app")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    def __init__(self) -> None:
        self._validate()

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    def _validate(self) -> None:
        """Fail fast when unsafe or malformed settings are supplied."""
        if not self.API_PREFIX.startswith("/"):
            raise ValueError("API_PREFIX must start with '/'")
        if self.ACCESS_TOKEN_EXPIRE_MINUTES <= 0:
            raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES must be greater than zero")
        if self.ENVIRONMENT.lower() == "production" and self.SECRET_KEY == "change-me-in-production":
            raise ValueError("SECRET_KEY must be configured in production")
        for origin in self.cors_origins:
            parsed = urlparse(origin)
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                raise ValueError(f"Invalid CORS origin: {origin}")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
