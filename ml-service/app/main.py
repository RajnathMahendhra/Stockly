import os
os.environ["MPLCONFIGDIR"] = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "cache"))
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.prediction_schema import (
    TrainRequest,
    PredictRequest,
    PredictionResult,
    HealthResponse,
    ModelDetail,
    MetricSummary
)
from app.data.data_loader import (
    fetch_historical_data,
    get_company_profile,
    STOCK_CATALOG
)
from app.features.engineer import engineer_features, FEATURE_COLUMNS
from app.services.trainer import train_and_evaluate_all, SAVED_MODELS_DIR
from app.services.predictor import predict_stock_price, MODEL_DISPLAY_NAMES

app = FastAPI(
    title="Stockly Machine Learning Microservice",
    description="Time-series forecasting and statistical evaluation engine for Stockly",
    version="1.2.0"
)

# Enable CORS for internal Express backend and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        service="Stockly-ML-Microservice",
        version="1.2.0",
        models_available=list(MODEL_DISPLAY_NAMES.keys()),
        timestamp=datetime.now().isoformat()
    )

@app.get("/models")
def list_models():
    """
    Returns catalogue of all implemented models and their theoretical categorization.
    """
    models = [
        {
            "id": "naive_baseline",
            "name": "Naive Persistence Baseline",
            "category": "Baseline Benchmark",
            "description": "Assumes tomorrow's price equals today's closing price (random walk benchmark).",
            "supported_horizons": [1, 5, 20],
            "is_trained": True,
            "status": "ready"
        },
        {
            "id": "linear_regression",
            "name": "Ridge Regularized Linear Model",
            "category": "Parametric Statistical",
            "description": "L2-regularized linear model trained on causal technical indicators and momentum lags.",
            "supported_horizons": [1, 5, 20],
            "is_trained": True,
            "status": "ready"
        },
        {
            "id": "random_forest",
            "name": "Random Forest Regressor",
            "category": "Non-linear Ensemble",
            "description": "Bagged ensemble of randomized decision trees capturing non-linear feature interactions.",
            "supported_horizons": [1, 5, 20],
            "is_trained": True,
            "status": "ready"
        },
        {
            "id": "xgboost",
            "name": "XGBoost Regressor",
            "category": "Gradient Boosted Trees",
            "description": "Sequentially optimizes residual errors with second-order gradient regularization.",
            "supported_horizons": [1, 5, 20],
            "is_trained": True,
            "status": "ready"
        },
        {
            "id": "lstm",
            "name": "LSTM Neural Network",
            "category": "Deep Sequential Learning",
            "description": "Recurrent architecture with gating mechanisms to preserve temporal context over sequential lookback windows.",
            "supported_horizons": [1, 5, 20],
            "is_trained": True,
            "status": "ready"
        }
    ]
    return {"models": models}

@app.get("/models/{model_name}/metrics")
def get_model_metrics(model_name: str, symbol: str = "AAPL"):
    """
    Retrieves held-out evaluation metrics for a specific model and stock.
    """
    sym = symbol.upper().strip()
    try:
        metadata = train_and_evaluate_all(sym, period="2y", force_retrain=False)
        if model_name not in metadata["models"]:
            raise HTTPException(status_code=404, detail=f"Model {model_name} not found.")

        metrics = metadata["models"][model_name]
        return {
            "symbol": sym,
            "model_name": model_name,
            "model_display_name": MODEL_DISPLAY_NAMES.get(model_name, model_name),
            "metrics": metrics,
            "sample_count": metadata.get("test_samples", 0),
            "date_ranges": metadata.get("date_ranges", {}),
            "feature_importance": metadata.get("feature_importances", {}).get(model_name, [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
def train_models(request: TrainRequest):
    """
    Triggers chronological model training and evaluation for a stock symbol.
    """
    try:
        metadata = train_and_evaluate_all(
            symbol=request.symbol,
            period=request.period,
            test_size=request.test_size,
            force_retrain=request.force_retrain
        )
        return {
            "message": f"Successfully trained models for {request.symbol.upper()}",
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training pipeline error: {str(e)}")

@app.post("/predict", response_model=PredictionResult)
def predict_price(request: PredictRequest):
    """
    Generates multi-step future price forecasts using the designated trained model.
    """
    try:
        result = predict_stock_price(
            symbol=request.symbol,
            model_name=request.model_name,
            horizon=request.horizon
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/stocks/search")
def search_stocks(q: str = Query(..., min_length=1)):
    """
    Searches available securities across US and Indian exchanges.
    """
    query = q.upper().strip()
    results = []
    for sym, data in STOCK_CATALOG.items():
        if query in sym or query in data["name"].upper():
            results.append({
                "symbol": sym,
                "name": data["name"],
                "exchange": data["exchange"],
                "currency": data["currency"],
                "sector": data["sector"],
                "country": data["country"]
            })
    return {"results": results}

@app.get("/stocks/{symbol}/history")
def get_stock_history(symbol: str, period: str = "1y"):
    """
    Retrieves historical OHLCV data with precomputed indicators.
    Preserves all bars for short periods (1mo, 3mo) without dropping rows.
    """
    sym = symbol.upper().strip()
    norm_period = "1mo" if period.lower() in ["1m", "1mo"] else period.lower()
    try:
        import numpy as np
        df = fetch_historical_data(sym, period=norm_period)
        
        df_display = df.copy()
        df_display.sort_values("Date", ascending=True, inplace=True)
        df_display.reset_index(drop=True, inplace=True)

        close = df_display["Close"]
        return_1d = close.pct_change(1).fillna(0.0)

        # Causal RSI (min_periods=1 preserves all bars)
        delta = close.diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        avg_gain = gain.ewm(alpha=1/14, min_periods=1, adjust=False).mean()
        avg_loss = loss.ewm(alpha=1/14, min_periods=1, adjust=False).mean()
        rs = avg_gain / (avg_loss + 1e-9)
        rsi_14 = (100.0 - (100.0 / (1.0 + rs))).fillna(50.0)

        # MACD
        ema_12 = close.ewm(span=12, min_periods=1, adjust=False).mean()
        ema_26 = close.ewm(span=26, min_periods=1, adjust=False).mean()
        macd = (ema_12 - ema_26) / (close + 1e-9)
        macd_signal = macd.ewm(span=9, min_periods=1, adjust=False).mean()

        # Rolling Volatility
        prev_close = close.shift(1).bfill()
        log_ret = np.log(close / (prev_close + 1e-9))
        vol_20 = (log_ret.rolling(window=min(len(close), 20), min_periods=1).std() * np.sqrt(252)).fillna(0.2)

        # Convert to JSON serializable record format
        records = []
        for i, row in df_display.iterrows():
            records.append({
                "date": str(row["Date"].strftime("%Y-%m-%d")),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
                "return_1d": round(float(return_1d.iloc[i]) * 100, 2),
                "rsi_14": round(float(rsi_14.iloc[i]), 2),
                "macd": round(float(macd.iloc[i]), 4),
                "macd_signal": round(float(macd_signal.iloc[i]), 4),
                "volatility_20": round(float(vol_20.iloc[i]) * 100, 2)
            })

        profile = get_company_profile(sym)
        latest_close = records[-1]["close"] if records else 0.0
        prev_close_val = records[-2]["close"] if len(records) > 1 else latest_close
        change = round(latest_close - prev_close_val, 2)
        change_pct = round((change / (prev_close_val + 1e-9)) * 100, 2)

        return {
            "symbol": sym,
            "profile": profile,
            "period": norm_period,
            "latest": {
                "close": latest_close,
                "date": records[-1]["date"] if records else "",
                "change": change,
                "change_pct": change_pct
            },
            "history": records
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
