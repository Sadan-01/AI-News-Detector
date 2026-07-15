from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.database.session import get_db
from app.dependencies.services import get_prediction_service
from app.models.user import User
from app.schemas.prediction import PredictionCreate, PredictionRead
from app.schemas.response import APIResponse, ERROR_RESPONSES
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="", tags=["Prediction"])


@router.post(
    "/predict",
    response_model=APIResponse[PredictionRead],
    status_code=status.HTTP_201_CREATED,
    summary="Analyze news text",
    description="Run fake-news detection for submitted text and store the prediction.",
    responses=ERROR_RESPONSES,
)
def predict(
    payload: PredictionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> APIResponse[PredictionRead]:
    record = prediction_service.predict(db, user=current_user, news_text=payload.news_text)
    return APIResponse(success=True, message="Prediction generated successfully", data=record)


@router.get(
    "/predictions",
    response_model=APIResponse[list[PredictionRead]],
    summary="List predictions",
    description="Return all predictions created by the authenticated user.",
    responses=ERROR_RESPONSES,
)
def list_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> APIResponse[list[PredictionRead]]:
    records = prediction_service.list_predictions(db, user=current_user)
    return APIResponse(success=True, message="Predictions fetched successfully", data=records)


@router.delete(
    "/predictions/{prediction_id}",
    response_model=APIResponse[None],
    summary="Delete prediction",
    description="Delete one prediction owned by the authenticated user.",
    responses=ERROR_RESPONSES,
)
def remove_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    prediction_service: PredictionService = Depends(get_prediction_service),
) -> APIResponse[None]:
    prediction_service.delete_prediction(db, user=current_user, prediction_id=prediction_id)
    return APIResponse(success=True, message="Prediction deleted successfully")
