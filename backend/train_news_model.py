from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline


BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
DATASET_DIR = PROJECT_DIR / "ml" / "dataset"
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "news_classifier.joblib"
RANDOM_STATE = 42


def load_dataset() -> pd.DataFrame:
    true_df = pd.read_csv(DATASET_DIR / "True.csv")
    fake_df = pd.read_csv(DATASET_DIR / "Fake.csv")

    true_df = true_df.assign(label="Real")
    fake_df = fake_df.assign(label="Fake")
    data = pd.concat([true_df, fake_df], ignore_index=True)

    # Training combines title and body; inference sends submitted text through
    # the same saved TF-IDF and classifier pipeline.
    data["combined_text"] = (
        data["title"].fillna("").astype(str).str.strip()
        + " "
        + data["text"].fillna("").astype(str).str.strip()
    ).str.strip()
    data = data[data["combined_text"].str.len() > 0]
    return data[["combined_text", "label"]]


def build_pipeline() -> Pipeline:
    return Pipeline(
        steps=[
            (
                "tfidf",
                TfidfVectorizer(
                    lowercase=True,
                    strip_accents="unicode",
                    stop_words="english",
                    ngram_range=(1, 2),
                    max_df=0.9,
                    min_df=2,
                    max_features=100000,
                ),
            ),
            (
                "classifier",
                LogisticRegression(
                    class_weight="balanced",
                    max_iter=1000,
                    random_state=RANDOM_STATE,
                    solver="liblinear",
                ),
            ),
        ]
    )


def main() -> None:
    data = load_dataset()
    train_text, test_text, train_labels, test_labels = train_test_split(
        data["combined_text"],
        data["label"],
        test_size=0.2,
        stratify=data["label"],
        random_state=RANDOM_STATE,
    )

    pipeline = build_pipeline()
    pipeline.fit(train_text, train_labels)

    predictions = pipeline.predict(test_text)
    print(f"Dataset rows: {len(data)}")
    print(f"Accuracy: {accuracy_score(test_labels, predictions):.4f}")
    print(classification_report(test_labels, predictions, target_names=["Fake", "Real"]))
    print("Confusion Matrix [[Fake, Real], [Fake, Real]]:")
    print(confusion_matrix(test_labels, predictions, labels=["Fake", "Real"]))

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "pipeline": pipeline,
            "labels": ["Fake", "Real"],
            "text_format": "title + text during training; raw submitted news text during inference",
        },
        MODEL_PATH,
    )
    print(f"Saved model: {MODEL_PATH}")


if __name__ == "__main__":
    main()
