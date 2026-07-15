from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenData
from app.schemas.response import APIResponse, ERROR_RESPONSES
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import AuthService
from app.dependencies.services import get_auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=APIResponse[UserRead],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a user account with a unique email and username.",
    responses=ERROR_RESPONSES,
)
def register(
    payload: UserCreate,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
) -> APIResponse[UserRead]:
    user = auth_service.register(db, payload)
    return APIResponse(success=True, message="User registered successfully", data=user)


@router.post(
    "/login",
    response_model=APIResponse[TokenData],
    summary="Login user",
    description="Authenticate with email and password and receive a JWT access token.",
    responses=ERROR_RESPONSES,
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
) -> APIResponse[TokenData]:
    token = auth_service.login(db, payload)
    return APIResponse(success=True, message="Login successful", data=token)


@router.get(
    "/me",
    response_model=APIResponse[UserRead],
    summary="Get current user",
    description="Return the authenticated user's account details.",
    responses=ERROR_RESPONSES,
)
def me(current_user: User = Depends(get_current_user)) -> APIResponse[UserRead]:
    return APIResponse(success=True, message="Current user fetched successfully", data=current_user)
