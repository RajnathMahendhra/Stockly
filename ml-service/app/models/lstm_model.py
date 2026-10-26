import os
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from typing import List, Dict

# Ensure local project-scoped keras cache directory
os.environ["KERAS_HOME"] = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", ".keras"))
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

TF_AVAILABLE = False
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import EarlyStopping
    TF_AVAILABLE = True
except Exception:
    TF_AVAILABLE = False
    from sklearn.neural_network import MLPRegressor

class LSTMNeuralNetworkModel:
    """
    Model E: Long Short-Term Memory (LSTM) Recurrent Neural Network.
    Processes sequential time-series patterns across multi-day lookback windows.
    Includes an automatic neural fallback (MLPRegressor) if deep learning dependencies are unavailable.
    """
    def __init__(self, lookback_window: int = 15, epochs: int = 25, batch_size: int = 16):
        self.name = "lstm"
        self.display_name = "LSTM Deep Learning Network"
        self.lookback_window = lookback_window
        self.epochs = epochs
        self.batch_size = batch_size
        self.scaler_X = MinMaxScaler(feature_range=(0, 1))
        self.scaler_y = MinMaxScaler(feature_range=(0, 1))
        self.is_trained = False
        self.model = None
        self.feature_names = []
        self.is_tf_native = TF_AVAILABLE

    def _create_sequences(self, X: np.ndarray, y: np.ndarray):
        X_seq, y_seq = [], []
        for i in range(len(X) - self.lookback_window):
            X_seq.append(X[i:i + self.lookback_window])
            y_seq.append(y[i + self.lookback_window])
        return np.array(X_seq), np.array(y_seq)

    def fit(self, X: np.ndarray, y: np.ndarray, feature_names: List[str] = None):
        self.feature_names = feature_names or [f"f_{i}" for i in range(X.shape[1])]
        X_scaled = self.scaler_X.fit_transform(X)
        y_scaled = self.scaler_y.fit_transform(y.reshape(-1, 1)).flatten()

        if self.is_tf_native and len(X_scaled) > (self.lookback_window + 20):
            try:
                X_seq, y_seq = self._create_sequences(X_scaled, y_scaled)
                n_features = X.shape[1]

                model = Sequential([
                    LSTM(32, return_sequences=True, input_shape=(self.lookback_window, n_features)),
                    Dropout(0.2),
                    LSTM(16, return_sequences=False),
                    Dropout(0.2),
                    Dense(16, activation="relu"),
                    Dense(1)
                ])
                model.compile(optimizer="adam", loss="mean_squared_error")
                early_stop = EarlyStopping(monitor="loss", patience=4, restore_best_weights=True)
                model.fit(
                    X_seq, y_seq,
                    epochs=self.epochs,
                    batch_size=self.batch_size,
                    verbose=0,
                    callbacks=[early_stop]
                )
                self.model = model
                self.is_trained = True
                return
            except Exception as e:
                # Fall through to MLP neural fallback
                self.is_tf_native = False

        # Neural Network Fallback via Multi-Layer Perceptron
        self.model = MLPRegressor(
            hidden_layer_sizes=(64, 32),
            activation="relu",
            solver="adam",
            max_iter=150,
            random_state=42
        )
        self.model.fit(X_scaled, y_scaled)
        self.is_trained = True

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise ValueError("LSTM model is not trained yet.")
        X_scaled = self.scaler_X.transform(X)

        if self.is_tf_native and hasattr(self.model, "predict"):
            # If sequence length matches
            if len(X_scaled) >= self.lookback_window:
                seqs = []
                for i in range(len(X_scaled) - self.lookback_window + 1):
                    seqs.append(X_scaled[i:i + self.lookback_window])
                preds_scaled = self.model.predict(np.array(seqs), verbose=0).flatten()
                preds = self.scaler_y.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()
                # Pad beginning with first prediction to maintain identical array length
                pad = np.full(self.lookback_window - 1, preds[0])
                return np.concatenate([pad, preds])

        # MLP path
        preds_scaled = self.model.predict(X_scaled)
        return self.scaler_y.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()
