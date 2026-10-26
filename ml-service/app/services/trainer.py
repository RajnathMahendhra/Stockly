import os
import json
import logging
from datetime import datetime
import numpy as np
import joblib

from app.data.data_loader import fetch_historical_data, get_company_profile
from app.features.engineer import (
    engineer_features,
    chronological_train_test_split,
    FEATURE_COLUMNS
)
from app.evaluation.metrics import compute_all_metrics
from app.models.baseline import NaiveBaselineModel
from app.models.linear_model import LinearRegressionModel
from app.models.random_forest import RandomForestModel
from app.models.xgboost_model import XGBoostModel
from app.models.lstm_model import LSTMNeuralNetworkModel

logger = logging.getLogger("stockly.trainer")
SAVED_MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "saved_models")
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

MODEL_CLASSES = {
    "naive_baseline": NaiveBaselineModel,
    "linear_regression": LinearRegressionModel,
    "random_forest": RandomForestModel,
    "xgboost": XGBoostModel,
    "lstm": LSTMNeuralNetworkModel,
}

def train_and_evaluate_all(
    symbol: str = "AAPL",
    period: str = "2y",
    test_size: float = 0.20,
    force_retrain: bool = False
) -> dict:
    """
    Trains all candidate models using strict chronological time-series methodology.
    Prevents lookahead bias:
      1. Features computed solely on causal rolling windows.
      2. No random shuffling; strict chronological split.
      3. Scalers fitted strictly on training data.
      4. Models evaluated on the identical unseen holdout period.
    """
    sym = symbol.upper().strip()
    metadata_file = os.path.join(SAVED_MODELS_DIR, f"{sym}_metadata.json")

    # Check if existing models are already trained and valid
    if not force_retrain and os.path.exists(metadata_file):
        try:
            with open(metadata_file, "r") as f:
                cached_meta = json.load(f)
            logger.info(f"Loaded existing trained models metadata for {sym}.")
            return cached_meta
        except Exception as e:
            logger.warning(f"Could not read existing metadata for {sym}: {e}")

    logger.info(f"Initiating full training pipeline for {sym}...")
    df = fetch_historical_data(sym, period=period)
    processed_df = engineer_features(df, target_horizon=1)

    if len(processed_df) < 50:
        raise ValueError(f"Insufficient historical data ({len(processed_df)} rows) to train models for {sym}.")

    # Chronological Split
    train_df, test_df, X_train, y_train, X_test, y_test = chronological_train_test_split(
        processed_df, test_size=test_size
    )

    train_start = str(train_df["Date"].iloc[0].strftime("%Y-%m-%d"))
    train_end = str(train_df["Date"].iloc[-1].strftime("%Y-%m-%d"))
    test_start = str(test_df["Date"].iloc[0].strftime("%Y-%m-%d"))
    test_end = str(test_df["Date"].iloc[-1].strftime("%Y-%m-%d"))

    # Reference previous day's close for test directional accuracy
    test_prev_close = test_df["Close"].values

    eval_results = {}
    top_features = {}

    for model_key, model_cls in MODEL_CLASSES.items():
        logger.info(f"Training {model_key} for {sym}...")
        model_instance = model_cls()

        if model_key == "naive_baseline":
            # Naive baseline predicts that tomorrow's price equals today's close
            y_pred = test_prev_close
            metrics = compute_all_metrics(y_test, y_pred, test_prev_close)
            eval_results[model_key] = metrics
            top_features[model_key] = [{"feature": "Last_Close_Price", "importance": 100.0, "percentage": 100.0}]
        else:
            # Fit model
            model_instance.fit(X_train, y_train, feature_names=FEATURE_COLUMNS)
            y_pred = model_instance.predict(X_test)
            metrics = compute_all_metrics(y_test, y_pred, test_prev_close)
            eval_results[model_key] = metrics

            # Extract feature importance if available
            if hasattr(model_instance, "get_top_features"):
                top_features[model_key] = model_instance.get_top_features(top_k=8)
            elif hasattr(model_instance, "coefficients"):
                sorted_coefs = sorted(
                    model_instance.coefficients.items(),
                    key=lambda x: abs(x[1]),
                    reverse=True
                )[:8]
                tot = sum(abs(v) for _, v in sorted_coefs) + 1e-9
                top_features[model_key] = [
                    {"feature": k, "importance": round(v, 4), "percentage": round(abs(v) / tot * 100, 2)}
                    for k, v in sorted_coefs
                ]
            else:
                top_features[model_key] = []

        # Serialize model artifact
        artifact_path = os.path.join(SAVED_MODELS_DIR, f"{sym}_{model_key}.joblib")
        try:
            joblib.dump(model_instance, artifact_path)
        except Exception as e:
            logger.warning(f"Could not joblib dump {model_key}: {e}")

    # Determine best performing model on the unseen holdout test set (by RMSE)
    best_model_name = min(eval_results.keys(), key=lambda k: eval_results[k]["rmse"])

    metadata = {
        "symbol": sym,
        "company_profile": get_company_profile(sym),
        "trained_at": datetime.now().isoformat(),
        "total_observations": len(processed_df),
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "date_ranges": {
            "train_start": train_start,
            "train_end": train_end,
            "test_start": test_start,
            "test_end": test_end
        },
        "best_model": best_model_name,
        "models": eval_results,
        "feature_importances": top_features,
        "latest_close": float(processed_df["Close"].iloc[-1]),
        "latest_date": str(processed_df["Date"].iloc[-1].strftime("%Y-%m-%d"))
    }

    with open(metadata_file, "w") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Training and holdout evaluation complete for {sym}. Best model: {best_model_name}")
    return metadata
