from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic import field_validator


class PredictionCreate(BaseModel):
    news_text: str = Field(..., min_length=20, max_length=10000)

    @field_validator("news_text")
    @classmethod
    def clean_news_text(cls, value: str) -> str:
        normalized = " ".join(value.strip().split())
        if len(normalized) < 20:
            raise ValueError("News text must contain at least 20 meaningful characters")
        return normalized


class PredictionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    news_text: str
    prediction: str
    confidence: float = Field(..., ge=0, le=100)
    created_at: datetime
