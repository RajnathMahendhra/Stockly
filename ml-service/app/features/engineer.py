import numpy as np
import pandas as pd
from typing import Tuple, List

FEATURE_COLUMNS = [
    "return_1d",
    "return_5d",
    "lag_1",
    "lag_2",
    "lag_3",
    "lag_5",
    "sma_10_ratio",
    "sma_20_ratio",
    "sma_50_ratio",
    "rsi_14",
    "macd",
    "macd_signal",
    "macd_hist",
    "bb_upper_ratio",
    "bb_lower_ratio",
    "bb_pct_b",
    "volatility_20",
    "volume_ratio"
]

def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """
    Computes Wilder's Relative Strength Index (RSI) using exponential moving average of gains/losses.
    Strictly causal without future information.
    """
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    
    # Use exponential moving average for smoothing
    avg_gain = gain.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1/period, min_periods=period, adjust=False).mean()
    
    rs = avg_gain / (avg_loss + 1e-9)
    rsi = 100.0 - (100.0 / (1.0 + rs))
    return rsi

def engineer_features(df: pd.DataFrame, target_horizon: int = 1) -> pd.DataFrame:
    """
    Builds technical and statistical time-series features strictly using
    data available up to time t (no future data leakage).
    """
    data = df.copy()
    data.sort_values("Date", ascending=True, inplace=True)
    data.reset_index(drop=True, inplace=True)

    close = data["Close"]
    volume = data["Volume"]

    # 1. Lagged returns
    data["return_1d"] = close.pct_change(1)
    data["return_5d"] = close.pct_change(5)

    # 2. Lagged raw prices normalized relative to current Close
    data["lag_1"] = close.shift(1) / close
    data["lag_2"] = close.shift(2) / close
    data["lag_3"] = close.shift(3) / close
    data["lag_5"] = close.shift(5) / close

    # 3. Simple Moving Averages relative to close
    sma_10 = close.rolling(window=10).mean()
    sma_20 = close.rolling(window=20).mean()
    sma_50 = close.rolling(window=50).mean()
    data["sma_10_ratio"] = close / (sma_10 + 1e-9)
    data["sma_20_ratio"] = close / (sma_20 + 1e-9)
    data["sma_50_ratio"] = close / (sma_50 + 1e-9)

    # 4. Exponential Moving Averages & MACD
    ema_12 = close.ewm(span=12, adjust=False).mean()
    ema_26 = close.ewm(span=26, adjust=False).mean()
    data["macd"] = (ema_12 - ema_26) / close
    data["macd_signal"] = data["macd"].ewm(span=9, adjust=False).mean()
    data["macd_hist"] = data["macd"] - data["macd_signal"]

    # 5. Relative Strength Index (14 periods)
    data["rsi_14"] = calculate_rsi(close, period=14)

    # 6. Bollinger Bands (20 periods, 2 std deviations)
    rolling_std = close.rolling(window=20).std()
    bb_upper = sma_20 + (2.0 * rolling_std)
    bb_lower = sma_20 - (2.0 * rolling_std)
    data["bb_upper_ratio"] = bb_upper / close
    data["bb_lower_ratio"] = bb_lower / close
    # %B indicates where price is relative to the bands
    data["bb_pct_b"] = (close - bb_lower) / ((bb_upper - bb_lower) + 1e-9)

    # 7. Historical Volatility (20-day annualized standard deviation of log returns)
    log_returns = np.log(close / close.shift(1))
    data["volatility_20"] = log_returns.rolling(window=20).std() * np.sqrt(252)

    # 8. Volume Dynamics
    vol_sma_20 = volume.rolling(window=20).mean()
    data["volume_ratio"] = volume / (vol_sma_20 + 1e-9)

    # 9. Supervised Target: Price at t + target_horizon
    data["target"] = close.shift(-target_horizon)

    # Clean initial NaN rows created by rolling windows (e.g. 50 periods)
    # and final rows created by shift(-target_horizon)
    clean_data = data.dropna(subset=FEATURE_COLUMNS + ["target"]).copy()
    clean_data.reset_index(drop=True, inplace=True)

    return clean_data

def chronological_train_test_split(
    df: pd.DataFrame,
    test_size: float = 0.20
) -> Tuple[pd.DataFrame, pd.DataFrame, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Performs strict chronological time-series splitting without shuffling.
    Prevents lookahead bias and data leakage into the evaluation period.
    """
    total_len = len(df)
    train_len = int(total_len * (1.0 - test_size))

    train_df = df.iloc[:train_len].copy()
    test_df = df.iloc[train_len:].copy()

    X_train = train_df[FEATURE_COLUMNS].values
    y_train = train_df["target"].values

    X_test = test_df[FEATURE_COLUMNS].values
    y_test = test_df["target"].values

    return train_df, test_df, X_train, y_train, X_test, y_test
