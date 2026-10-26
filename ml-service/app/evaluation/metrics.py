import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import Dict, Optional

def compute_all_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    prev_close: Optional[np.ndarray] = None
) -> Dict[str, float]:
    """
    Computes standard academic and financial evaluation metrics on out-of-sample holdout test sets.
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)

    if len(y_true) == 0 or len(y_pred) == 0:
        return {
            "mae": 0.0,
            "rmse": 0.0,
            "directional_accuracy": 50.0,
            "mape": 0.0,
            "r2": 0.0
        }

    # 1. MAE
    mae = float(mean_absolute_error(y_true, y_pred))

    # 2. RMSE
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))

    # 3. MAPE (Mean Absolute Percentage Error) - with non-zero safety
    denom = np.where(np.abs(y_true) < 1e-4, 1.0, y_true)
    mape = float(np.mean(np.abs((y_true - y_pred) / denom)) * 100.0)

    # 4. R2 Score (coefficient of determination)
    try:
        r2 = float(r2_score(y_true, y_pred))
    except Exception:
        r2 = 0.0

    # 5. Directional Accuracy (%)
    # Compares sign(y_t - y_{t-1}) vs sign(y_pred_t - y_{t-1})
    if prev_close is not None and len(prev_close) == len(y_true):
        actual_direction = np.sign(y_true - prev_close)
        pred_direction = np.sign(y_pred - prev_close)
        # 1 if directions match, 0 otherwise
        matches = (actual_direction == pred_direction)
        directional_acc = float(np.mean(matches) * 100.0)
    else:
        # Fallback using one-step diff on y_true
        if len(y_true) > 1:
            actual_diff = np.diff(y_true)
            pred_diff = np.diff(y_pred)
            directional_acc = float(np.mean(np.sign(actual_diff) == np.sign(pred_diff)) * 100.0)
        else:
            directional_acc = 50.0

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "directional_accuracy": round(directional_acc, 2),
        "mape": round(mape, 2),
        "r2": round(r2, 4)
    }
