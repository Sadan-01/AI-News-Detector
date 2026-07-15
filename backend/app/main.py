from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.database import Base, engine
from app.exceptions.handlers import register_exception_handlers
from app.middleware.authentication import AuthenticationContextMiddleware
from app.routes import auth, prediction, users
from app.utils.logging import configure_logging, get_logger

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize application resources at process startup."""
    Base.metadata.create_all(bind=engine)
    logger.info("Server startup complete")
    yield
    logger.info("Server shutdown complete")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-ready REST API for an AI Fake News Detection System.",
    version=settings.API_VERSION,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuthenticationContextMiddleware)

register_exception_handlers(app)

app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(prediction.router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Health"], summary="Health check")
def health_check() -> dict[str, str | bool]:
    """Return a basic health status for load balancers and uptime checks."""
    return {"success": True, "status": "ok", "service": settings.PROJECT_NAME}
