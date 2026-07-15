from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: T | None = None


ERROR_RESPONSES = {
    400: {"description": "Bad request"},
    401: {"description": "Authentication required or token invalid"},
    403: {"description": "Authenticated user is not allowed to perform this action"},
    404: {"description": "Resource not found"},
    409: {"description": "Resource conflict"},
    422: {"description": "Request validation error"},
    500: {"description": "Internal server error"},
}
