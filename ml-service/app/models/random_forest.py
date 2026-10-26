import numpy as np
from sklearn.ensemble import RandomForestRegressor
from typing import List, Dict

class RandomForestModel:
    """
    Model C: Random Forest Regressor using non-linear ensemble tree voting.
    Identifies non-linear indicator relationships and provides Mean Decrease in Impurity (MDI) feature importances.
    """
    def __init__(self, n_estimators: int = 100, max_depth: int = 8):
        self.name = "random_forest"
        self.display_name = "Random Forest Regressor"
        self.model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        self.is_trained = False
        self.feature_names = []
        self.feature_importances_ = {}

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
