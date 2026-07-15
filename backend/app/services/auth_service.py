from fastapi import status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.crud.user import create_user, get_existing_user, get_user_by_email
from app.exceptions.exceptions import APIException
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenData
from app.schemas.user import UserCreate
from app.utils.logging import get_logger

logger = get_logger(__name__)


class AuthService:
    """Business logic for registration and authentication."""

    def register(self, db: Session, payload: UserCreate) -> User:
        existing_user = get_existing_user(db, email=payload.email, username=payload.username)
        if existing_user:
            if existing_user.email == payload.email.lower():
                raise APIException("Email is already registered", status.HTTP_409_CONFLICT)
            raise APIException("Username is already taken", status.HTTP_409_CONFLICT)

        user = create_user(db, payload)
        logger.info("User registered", extra={"user_id": user.id})
        return user

    def login(self, db: Session, payload: LoginRequest) -> TokenData:
        user = get_user_by_email(db, payload.email)
        if user is None or not verify_password(payload.password, user.password):
            logger.warning("Failed login attempt")
            raise APIException("Invalid credentials", status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            raise APIException("User account is inactive", status.HTTP_403_FORBIDDEN)

        logger.info("User authenticated", extra={"user_id": user.id})
        return TokenData(access_token=create_access_token(str(user.id)), user=user)
