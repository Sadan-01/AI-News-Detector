from fastapi import status
from sqlalchemy.orm import Session

from app.crud.prediction import create_prediction, delete_prediction, get_prediction_by_id, get_user_predictions
from app.exceptions.exceptions import APIException
from app.models.prediction import Prediction
from app.models.user import User
from app.services.ai_service import AIService
from app.utils.logging import get_logger

logger = get_logger(__name__)


class PredictionService:
    """Coordinates AI inference with prediction persistence."""

    def __init__(self, ai_service: AIService | None = None) -> None:
        self.ai_service = ai_service or AIService()

    def predict(self, db: Session, *, user: User, news_text: str) -> Prediction:
        result = self.ai_service.predict(news_text)
        record = create_prediction(
            db,
            user_id=user.id,
            news_text=news_text,
            prediction=result.prediction,
            confidence=result.confidence,
        )
        logger.info("Prediction created", extra={"user_id": user.id, "prediction_id": record.id})
        return record

    def list_predictions(self, db: Session, *, user: User) -> list[Prediction]:
        return get_user_predictions(db, user_id=user.id)

    def delete_prediction(self, db: Session, *, user: User, prediction_id: int) -> None:
        record = get_prediction_by_id(db, prediction_id)
        if record is None or record.user_id != user.id:
            raise APIException("Prediction not found", status.HTTP_404_NOT_FOUND)
        delete_prediction(db, record)
        logger.info("Prediction deleted", extra={"user_id": user.id, "prediction_id": prediction_id})
