from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.crud.user import get_user_by_email, get_user_by_username, update_user
from app.database.session import get_db
from app.exceptions.exceptions import APIException
from app.models.user import User
from app.schemas.response import APIResponse, ERROR_RESPONSES
from app.schemas.user import UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/profile",
    response_model=APIResponse[UserRead],
    summary="Get profile",
    description="Return the authenticated user's profile.",
    responses=ERROR_RESPONSES,
)
def get_profile(current_user: User = Depends(get_current_user)) -> APIResponse[UserRead]:
    return APIResponse(success=True, message="Profile fetched successfully", data=current_user)


@router.put(
    "/profile",
    response_model=APIResponse[UserRead],
    summary="Update profile",
    description="Update the authenticated user's profile information.",
    responses=ERROR_RESPONSES,
)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> APIResponse[UserRead]:
    if payload.email and payload.email.lower() != current_user.email:
        existing = get_user_by_email(db, payload.email)
        if existing:
            raise APIException("Email is already registered", status.HTTP_409_CONFLICT)
    if payload.username and payload.username != current_user.username:
        existing = get_user_by_username(db, payload.username)
        if existing:
            raise APIException("Username is already taken", status.HTTP_409_CONFLICT)

    user = update_user(db, current_user, payload)
    return APIResponse(success=True, message="Profile updated successfully", data=user)
