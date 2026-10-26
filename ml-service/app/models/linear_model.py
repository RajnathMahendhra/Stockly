import numpy as np
from sklearn.linear_model import Ridge, LinearRegression
from sklearn.preprocessing import StandardScaler

class LinearRegressionModel:
    """
    Model B: Linear Regression with engineered technical features.
    Uses Ridge regularization to prevent collinearity issues among technical indicators.
    Scales features using standard normalizer fit exclusively on training data.
    """
    def __init__(self, alpha: float = 1.0):
        self.name = "linear_regression"
        self.display_name = "Regularized Linear Model"
        self.scaler = StandardScaler()
        self.model = Ridge(alpha=alpha)
        self.is_trained = False
        self.feature_names = []
        self.coefficients = {}

    def fit(self, X: np.ndarray, y: np.ndarray, feature_names: list = None):
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True
        self.feature_names = feature_names or [f"f_{i}" for i in range(X.shape[1])]
        self.coefficients = {
            feat: float(coef) for feat, coef in zip(self.feature_names, self.model.coef_)
        }

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise ValueError("Model is not trained yet.")
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)
