from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)


class Base(DeclarativeBase):
    """Base class for SQLAlchemy ORM models."""


from app.models import prediction, user  # noqa: E402,F401
