from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.security import decode_access_token


class AuthenticationContextMiddleware(BaseHTTPMiddleware):
    """Attach decoded authentication context to request.state when present."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request.state.user_id = None
        authorization = request.headers.get("Authorization", "")
        if authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1].strip()
            try:
                payload = decode_access_token(token)
                request.state.user_id = payload.get("sub")
            except ValueError:
                request.state.user_id = None
        return await call_next(request)
