from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.crud.user import get_user_by_id
from app.database.session import get_db
from app.exceptions.exceptions import APIException
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the active user represented by the bearer token."""
    try:
        payload = decode_access_token(token)
        print("TOKEN PAYLOAD:", payload)
        user_id = int(payload.get("sub", "0"))
    except Exception as e:
        print("JWT ERROR:", repr(e))
        raise APIException(
            message="Could not validate credentials",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user = get_user_by_id(db, user_id=user_id)
    print("USER:", user)

    user = get_user_by_id(db, user_id=user_id)
    if user is None or not user.is_active:
        raise APIException(
            message="Could not validate credentials",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    return user


def require_role(required_role: str):
    """Create a dependency that allows only users with a specific role."""

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise APIException(message="Insufficient permissions", status_code=status.HTTP_403_FORBIDDEN)
        return current_user

    return role_checker
