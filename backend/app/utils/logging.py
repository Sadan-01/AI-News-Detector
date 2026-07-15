import logging
from logging.config import dictConfig
from pathlib import Path

from app.core.config import BASE_DIR, settings


def configure_logging() -> None:
    """Configure console and file logging for the application."""
    log_dir = BASE_DIR / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
                }
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                },
                "file": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "formatter": "default",
                    "filename": str(Path(log_dir) / "app.log"),
                    "maxBytes": 1_000_000,
                    "backupCount": 3,
                },
            },
            "root": {
                "handlers": ["console", "file"],
                "level": settings.LOG_LEVEL,
            },
        }
    )


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
