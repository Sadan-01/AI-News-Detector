from transformers import dynamic_module_utils
from transformers import dynamic_module_utils
from transformers import dynamic_module_utils
from transformers import dynamic_module_utils
from transformers import dynamic_module_utils
from dataclasses import dataclass
from pathlib import Path

import joblib
import torch
from fastapi import status

from app.exceptions.exceptions import APIException
from app.utils.logging import get_logger


logger = get_logger(__name__)


@dataclass(frozen=True)
class AIResult:
    prediction: str
    confidence: float


class AIService:
    """Adapter boundary for fake-news inference."""

    _transformer: dict | None = None
    _tfidf_artifact: dict | None = None

    def __init__(self, model_path: Path | None = None, backup_model_path: Path | None = None) -> None:
        model_dir = Path(__file__).resolve().parents[2] / "model"
        self.model_path = model_path or model_dir / "transformer_news"
        self.backup_model_path = backup_model_path or model_dir / "news_classifier.joblib"

    def _load_transformer(self) -> dict:
        if AIService._transformer is None:
            try:
                from transformers import AutoModelForSequenceClassification, AutoTokenizer

                tokenizer = AutoTokenizer.from_pretrained(self.model_path)
                model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
                device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
                model.to(device)
                model.eval()
                AIService._transformer = {
                    "tokenizer": tokenizer,
                    "model": model,
                    "device": device,
                }
            except Exception as exc:
                logger.exception("Transformer model loading failed")
                raise APIException("Transformer prediction model is not available", status.HTTP_503_SERVICE_UNAVAILABLE) from exc
        return AIService._transformer

    def _load_tfidf_backup(self) -> dict:
        if AIService._tfidf_artifact is None:
            try:
                AIService._tfidf_artifact = joblib.load(self.backup_model_path)
            except Exception as exc:
                logger.exception("TF-IDF backup model loading failed")
                raise APIException("Prediction model is not available", status.HTTP_503_SERVICE_UNAVAILABLE) from exc
        return AIService._tfidf_artifact

    def _predict_with_transformer(self, news_text: str) -> AIResult:
        artifact = self._load_transformer()
        tokenizer = artifact["tokenizer"]
        model = artifact["model"]
        device = artifact["device"]

        try:
            inputs = tokenizer(news_text, return_tensors="pt", truncation=True, max_length=256)
            inputs = {key: value.to(device) for key, value in inputs.items()}
            with torch.no_grad():
                logits = model(**inputs).logits
            probabilities = torch.softmax(logits, dim=-1)[0]

            class_index = int(torch.argmax(probabilities).item())

            print("========== MODEL DEBUG ==========")
            print("Probabilities:", probabilities.tolist())
            print("Class index:", class_index)
            print("Labels:", model.config.id2label)
            print("=================================")

            label = model.config.id2label.get(class_index, str(class_index))
            confidence = round(float(probabilities[class_index].item()) * 100, 2)
            return AIResult(prediction=label, confidence=confidence)
        except Exception as exc:
            logger.exception("Transformer prediction failed")
            raise APIException("Prediction failed", status.HTTP_500_INTERNAL_SERVER_ERROR) from exc

    def _predict_with_tfidf_backup(self, news_text: str) -> AIResult:
        artifact = self._load_tfidf_backup()
        pipeline = artifact["pipeline"]
        prediction = pipeline.predict([news_text])[0]
        probabilities = pipeline.predict_proba([news_text])[0]
        class_index = list(pipeline.classes_).index(prediction)
        confidence = round(float(probabilities[class_index]) * 100, 2)
        return AIResult(prediction=str(prediction), confidence=confidence)

    def predict(self, news_text: str) -> AIResult:
        if self.model_path.exists():
            return self._predict_with_transformer(news_text)
        logger.warning("Transformer model is missing; using TF-IDF backup")
        return self._predict_with_tfidf_backup(news_text)
