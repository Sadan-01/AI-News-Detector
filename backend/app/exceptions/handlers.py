from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.exceptions.exceptions import APIException
from app.utils.logging import get_logger

logger = get_logger(__name__)

                                            
def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers for consistent API responses."""

    @app.exception_handler(APIException)
    async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
        logger.warning("Application error: %s", exc.message, extra={"path": request.url.path})
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "message": exc.message, "data": None},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = []

        for err in exc.errors():
            clean_error = {}

            for key, value in err.items():
                if isinstance(value, bytes):
                    clean_error[key] = value.decode("utf-8", errors="replace")
                else:
                    clean_error[key] = str(value) if isinstance(value, Exception) else value

            errors.append(clean_error)

        logger.warning(
            "Validation error",
            extra={
                "path": request.url.path,
                "errors": errors,
            },
        )

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "message": "Validation error",
                "data": errors,
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def database_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
        logger.exception("Database error", extra={"path": request.url.path})
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "message": "Database error", "data": None},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error", extra={"path": request.url.path})
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "message": "Internal server error", "data": None},
        )
