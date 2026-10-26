from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class StockDataPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    adj_close: Optional[float] = None

class TrainRequest(BaseModel):
    symbol: str = Field(default="AAPL", description="Ticker symbol (e.g., AAPL, MSFT, RELIANCE.NS)")
    period: str = Field(default="2y", description="Historical period to train on (e.g. 1y, 2y, 5y)")
    test_size: float = Field(default=0.2, description="Chronological holdout ratio (default: 0.20)")
    force_retrain: bool = Field(default=False, description="Whether to overwrite existing trained artifacts")

class PredictRequest(BaseModel):
    symbol: str = Field(default="AAPL", description="Ticker symbol")
    model_name: str = Field(default="random_forest", description="Model: naive_baseline, linear_regression, random_forest, xgboost, lstm")
    horizon: int = Field(default=5, description="Forecast horizon in trading days (1, 5, 20)")

class MetricSummary(BaseModel):
    mae: float
    rmse: float
    directional_accuracy: float
    mape: Optional[float] = None
    r2: Optional[float] = None
    sample_count: int
    train_start: str
    train_end: str
    test_start: str
    test_end: str

class ForecastPoint(BaseModel):
    step: int
    date: str
    predicted_close: float
    lower_bound: float
    upper_bound: float

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    percentage: float

class PredictionResult(BaseModel):
    symbol: str
    company_name: str
    model_name: str
    model_display_name: str
    model_version: str
    forecast_origin_date: str
    origin_close: float
    horizon_days: int
    forecasts: List[ForecastPoint]
    metrics: MetricSummary
    feature_importance: List[FeatureImportanceItem]
    explanation: Dict[str, Any]
    limitations: List[str]
    disclaimer: str

class ModelDetail(BaseModel):
    id: str
    name: str
    category: str
    description: str
    is_trained: bool
    status: str
    supported_horizons: List[int]
    metrics: Optional[MetricSummary] = None
    features: List[str]

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    models_available: List[str]
    timestamp: str
