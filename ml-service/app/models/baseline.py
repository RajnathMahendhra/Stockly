import numpy as np

class NaiveBaselineModel:
    """
    Model A: Naive Forecast Baseline (Random Walk Persistence Model).
    Forecasts that the future price at t+h equals the current observed price at t.
    Serves as the benchmark that all complex ML models must outperform.
    """
    def __init__(self):
        self.name = "naive_baseline"
        self.display_name = "Naive Baseline (Persistence)"
        self.is_trained = True

    def fit(self, X: np.ndarray, y: np.ndarray):
        # Baseline requires no parameter fitting
        pass

    def predict(self, current_close: np.ndarray) -> np.ndarray:
        return np.asarray(current_close, dtype=float)

    def forecast_horizon(self, latest_close: float, horizon_days: int) -> np.ndarray:
        # Static persistence: price remains at current level
        return np.full(horizon_days, latest_close, dtype=float)
