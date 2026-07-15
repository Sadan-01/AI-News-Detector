from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import torch
from datasets import Dataset
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    DataCollatorWithPadding,
    Trainer,
    TrainingArguments,
)


BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
DATASET_DIR = PROJECT_DIR / "ml" / "dataset"
MODEL_DIR = BASE_DIR / "model"
TRANSFORMER_MODEL_DIR = MODEL_DIR / "transformer_news"
TFIDF_MODEL_PATH = MODEL_DIR / "news_classifier.joblib"
REPORT_PATH = MODEL_DIR / "transformer_comparison_report.json"
RANDOM_STATE = 42
LABEL_TO_ID = {"Fake": 0, "Real": 1}
ID_TO_LABEL = {0: "Fake", 1: "Real"}


def clean_text(value: Any) -> str:
    text = "" if pd.isna(value) else str(value)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def first_words(text: str, limit: int = 80) -> str:
    return " ".join(text.split()[:limit])


def load_dataset() -> pd.DataFrame:
    true_df = pd.read_csv(DATASET_DIR / "True.csv")
    fake_df = pd.read_csv(DATASET_DIR / "Fake.csv")

    true_df = true_df.assign(label="Real")
    fake_df = fake_df.assign(label="Fake")
    data = pd.concat([true_df, fake_df], ignore_index=True)
    data["title"] = data["title"].map(clean_text)
    data["body"] = data["text"].map(clean_text)
    data["text"] = (data["title"] + " " + data["body"]).str.strip()
    data["snippet"] = data["body"].map(first_words)
    data = data[data["text"].str.len() > 0].copy()
    data["label_id"] = data["label"].map(LABEL_TO_ID)
    return data[["text", "title", "snippet", "label", "label_id"]]


def build_training_variants(data: pd.DataFrame) -> pd.DataFrame:
    variants = [data[["text", "label_id"]]]
    headline_rows = data.loc[data["title"].str.len() >= 20, ["title", "label_id"]].rename(columns={"title": "text"})
    snippet_rows = data.loc[data["snippet"].str.len() >= 20, ["snippet", "label_id"]].rename(columns={"snippet": "text"})
    variants.extend([headline_rows, snippet_rows])
    return pd.concat(variants, ignore_index=True).drop_duplicates()


def build_short_test_set(data: pd.DataFrame) -> pd.DataFrame:
    headline_rows = data.loc[data["title"].str.len() >= 20, ["title", "label_id"]].rename(columns={"title": "text"})
    snippet_rows = data.loc[data["snippet"].str.len() >= 20, ["snippet", "label_id"]].rename(columns={"snippet": "text"})
    return pd.concat([headline_rows, snippet_rows], ignore_index=True).drop_duplicates()


def compute_metrics(eval_prediction: tuple[np.ndarray, np.ndarray]) -> dict[str, float]:
    logits, labels = eval_prediction
    predictions = np.argmax(logits, axis=-1)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average="weighted")
    accuracy = accuracy_score(labels, predictions)
    return {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
    }


def evaluate_predictions(name: str, labels: list[int], predictions: list[int]) -> dict[str, Any]:
    report = classification_report(
        labels,
        predictions,
        labels=[0, 1],
        target_names=["Fake", "Real"],
        output_dict=True,
        zero_division=0,
    )
    matrix = confusion_matrix(labels, predictions, labels=[0, 1]).tolist()
    print(f"\n{name}")
    print(f"Accuracy: {accuracy_score(labels, predictions):.4f}")
    print(classification_report(labels, predictions, labels=[0, 1], target_names=["Fake", "Real"], zero_division=0))
    print("Confusion Matrix rows=true, cols=predicted [Fake, Real]:")
    print(np.array(matrix))
    return {
        "accuracy": float(accuracy_score(labels, predictions)),
        "classification_report": report,
        "confusion_matrix": matrix,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fine-tune a transformer fake-news classifier.")
    parser.add_argument("--model-name", default="distilbert-base-uncased", help="Hugging Face model id.")
    parser.add_argument("--output-dir", default=str(TRANSFORMER_MODEL_DIR), help="Directory for model/tokenizer output.")
    parser.add_argument("--epochs", type=float, default=1.0)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--learning-rate", type=float, default=2e-5)
    parser.add_argument("--max-length", type=int, default=256)
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument(
        "--max-samples",
        type=int,
        default=1000,
        help="Balanced sample limit for local CPU verification. Use 0 for full dataset training.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_dir = Path(args.output_dir)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    print(f"Base transformer: {args.model_name}")

    data = load_dataset()
    if args.max_samples and args.max_samples > 0:
        data = data.groupby("label", group_keys=False).sample(
            n=min(args.max_samples // 2, data["label"].value_counts().min()),
            random_state=RANDOM_STATE,
        )

    base_train_df, test_df = train_test_split(
        data,
        test_size=args.test_size,
        stratify=data["label_id"],
        random_state=RANDOM_STATE,
    )
    train_df = build_training_variants(base_train_df)
    short_test_df = build_short_test_set(test_df)

    tokenizer = AutoTokenizer.from_pretrained(args.model_name)

    def tokenize(batch: dict[str, list[str]]) -> dict[str, Any]:
        return tokenizer(batch["text"], truncation=True, max_length=args.max_length)

    train_dataset = Dataset.from_pandas(train_df[["text", "label_id"]], preserve_index=False).rename_column(
        "label_id", "labels"
    )
    test_dataset = Dataset.from_pandas(test_df[["text", "label_id"]], preserve_index=False).rename_column(
        "label_id", "labels"
    )
    train_dataset = train_dataset.map(tokenize, batched=True)
    test_dataset = test_dataset.map(tokenize, batched=True)

    model = AutoModelForSequenceClassification.from_pretrained(
        args.model_name,
        num_labels=2,
        id2label=ID_TO_LABEL,
        label2id=LABEL_TO_ID,
    )

    training_args = TrainingArguments(
        output_dir=str(output_dir / "checkpoints"),
        learning_rate=args.learning_rate,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        num_train_epochs=args.epochs,
        weight_decay=0.01,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        logging_steps=50,
        report_to=[],
        seed=RANDOM_STATE,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        tokenizer=tokenizer,
        data_collator=DataCollatorWithPadding(tokenizer=tokenizer),
        compute_metrics=compute_metrics,
    )
    trainer.train()

    transformer_output = trainer.predict(test_dataset)
    transformer_predictions = np.argmax(transformer_output.predictions, axis=-1).tolist()
    test_labels = test_df["label_id"].tolist()
    transformer_report = evaluate_predictions("Transformer model - full articles", test_labels, transformer_predictions)

    short_dataset = Dataset.from_pandas(short_test_df[["text", "label_id"]], preserve_index=False).rename_column(
        "label_id", "labels"
    )
    short_dataset = short_dataset.map(tokenize, batched=True)
    short_output = trainer.predict(short_dataset)
    short_predictions = np.argmax(short_output.predictions, axis=-1).tolist()
    short_labels = short_test_df["label_id"].tolist()
    transformer_short_report = evaluate_predictions(
        "Transformer model - headlines and short snippets", short_labels, short_predictions
    )

    comparison: dict[str, Any] = {
        "model_name": args.model_name,
        "device": device,
        "dataset_rows": int(len(data)),
        "training_rows_after_short_text_augmentation": int(len(train_df)),
        "label_mapping": {"Fake": 0, "Real": 1},
        "transformer": transformer_report,
        "transformer_short_text": transformer_short_report,
    }

    if TFIDF_MODEL_PATH.exists():
        tfidf_artifact = joblib.load(TFIDF_MODEL_PATH)
        tfidf_pipeline = tfidf_artifact["pipeline"]
        tfidf_predictions = [LABEL_TO_ID[label] for label in tfidf_pipeline.predict(test_df["text"])]
        comparison["tfidf_logistic_regression"] = evaluate_predictions(
            "TF-IDF + Logistic Regression backup - full articles", test_labels, tfidf_predictions
        )
        tfidf_short_predictions = [LABEL_TO_ID[label] for label in tfidf_pipeline.predict(short_test_df["text"])]
        comparison["tfidf_logistic_regression_short_text"] = evaluate_predictions(
            "TF-IDF + Logistic Regression backup - headlines and short snippets", short_labels, tfidf_short_predictions
        )

    output_dir.mkdir(parents=True, exist_ok=True)
    trainer.save_model(str(output_dir))
    tokenizer.save_pretrained(str(output_dir))
    (output_dir / "metadata.json").write_text(
        json.dumps(
            {
                "base_model": args.model_name,
                "label_to_id": LABEL_TO_ID,
                "id_to_label": ID_TO_LABEL,
                "max_length": args.max_length,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    REPORT_PATH.write_text(json.dumps(comparison, indent=2), encoding="utf-8")
    print(f"\nSaved transformer model/tokenizer: {output_dir}")
    print(f"Saved comparison report: {REPORT_PATH}")


if __name__ == "__main__":
    main()
