import numpy as np
from typing import List, Dict

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    from sklearn.ensemble import GradientBoostingRegressor

class XGBoostModel:
    """
    Model D: Gradient Boosted Trees (XGBoost Regressor).
    Optimizes a regularized objective function with second-order gradient approximations.
    """
    def __init__(self, n_estimators: int = 100, learning_rate: float = 0.05, max_depth: int = 5):
        self.name = "xgboost"
        self.display_name = "XGBoost Regressor"
        self.is_trained = False
        self.feature_names = []
        self.feature_importances_ = {}

        if XGBOOST_AVAILABLE:
            self.model = xgb.XGBRegressor(
                n_estimators=n_estimators,
                learning_rate=learning_rate,
                max_depth=max_depth,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1
            )
        else:
            self.model = GradientBoostingRegressor(
                n_estimators=n_estimators,
                learning_rate=learning_rate,
                max_depth=max_depth,
                random_state=42
            )

    def fit(self, X: np.ndarray, y: np.ndarray, feature_names: List[str] = None):
        self.model.fit(X, y)
        self.is_trained = True
        self.feature_names = feature_names or [f"f_{i}" for i in range(X.shape[1])]

        raw_importances = self.model.feature_importances_
        total = sum(raw_importances) + 1e-9
        self.feature_importances_ = {
            feat: round(float(imp / total) * 100.0, 2)
            for feat, imp in zip(self.feature_names, raw_importances)
        }

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise ValueError("Model is not trained yet.")
        return self.model.predict(X)

    def get_top_features(self, top_k: int = 10) -> List[Dict]:
        sorted_feats = sorted(self.feature_importances_.items(), key=lambda x: x[1], reverse=True)
        return [
            {"feature": k, "importance": v, "percentage": v}
            for k, v in sorted_feats[:top_k]
        ]
