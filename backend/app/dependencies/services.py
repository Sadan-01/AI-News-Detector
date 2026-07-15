from app.services.ai_service import AIService
from app.services.auth_service import AuthService
from app.services.prediction_service import PredictionService


def get_ai_service() -> AIService:
    """Provide the AI service adapter for dependency injection."""
    return AIService()


def get_auth_service() -> AuthService:
    """Provide authentication business logic."""
    return AuthService()


def get_prediction_service() -> PredictionService:
    """Provide prediction business logic."""
    return PredictionService(ai_service=get_ai_service())
