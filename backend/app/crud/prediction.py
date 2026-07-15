from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.prediction import Prediction


def create_prediction(
    db: Session,
    *,
    user_id: int,
    news_text: str,
    prediction: str,
    confidence: float,
) -> Prediction:
    record = Prediction(
        user_id=user_id,
        news_text=news_text,
        prediction=prediction,
        confidence=confidence,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_user_predictions(db: Session, user_id: int) -> list[Prediction]:
    statement = select(Prediction).where(Prediction.user_id == user_id).order_by(Prediction.created_at.desc())
    return list(db.scalars(statement).all())


def get_prediction_by_id(db: Session, prediction_id: int) -> Prediction | None:
    return db.get(Prediction, prediction_id)


def delete_prediction(db: Session, record: Prediction) -> None:
    db.delete(record)
    db.commit()
