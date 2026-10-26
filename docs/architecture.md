# Stockly: System Architecture & Technical Specifications

**Stockly** is an AI-driven full-stack framework for financial market exploration, causal technical indicator calculation, and multi-step future price forecasting.

---

## 1. High-Level System Architecture

Stockly employs a decoupled service-oriented architecture:
- **Presentation Layer**: React 19 SPA running on Vite with Tailwind CSS and Recharts financial charting.
- **API Gateway & Orchestration Layer**: Node.js & Express REST API managing JWT authentication, MongoDB ODM mapping, caching, rate limiting, and security headers.
- **Machine Learning & Econometric Microservice**: Python FastAPI service performing causal feature engineering, chronological model training, holdout evaluation, and multi-step recursive inference.
- **Persistence Layer**: MongoDB Atlas storing user credentials, stock metadata, cached historical OHLCV bars, watchlists, predictions, and model evaluations.

```mermaid
flowchart TD
    subgraph Client ["Client Presentation Tier (React 19 + Vite)"]
        UI["Tailwind CSS UI / Dashboards"]
        Charts["Recharts Interactive Charts"]
        AuthContext["Auth Context & JWT Store"]
    end

    subgraph Gateway ["Orchestration Tier (Express.js :5000)"]
        API["REST API Router"]
        AuthMW["JWT Auth Middleware"]
        MarketService["Market Data Service & Aggregator"]
        MLProxy["ML Client Microservice Proxy"]
        ErrorHandler["Centralized Error Handler"]
    end

    subgraph DataTier ["Persistence Tier (MongoDB Atlas)"]
        DB_Users[("Users Collection")]
        DB_Stocks[("Stocks Collection")]
        DB_Prices[("HistoricalPrices Collection")]
        DB_Watchlists[("Watchlists Collection")]
        DB_Predictions[("Predictions Collection")]
        DB_Evals[("ModelEvaluations Collection")]
    end

    subgraph MLSvc ["Machine Learning Tier (FastAPI :8000)"]
        ML_API["FastAPI Endpoints"]
        DataLoader["Historical Feed & Cache Loader"]
        FeatureEng["Strict Chronological Feature Engine"]
        
        subgraph ModelZoo ["Trained Model Registry"]
            Model_Naive["Naive Persistence Baseline"]
            Model_Ridge["Ridge Linear Regression"]
            Model_RF["Random Forest Regressor"]
            Model_XGB["XGBoost Regressor"]
            Model_LSTM["LSTM Deep Learning Network"]
        end

        EvalEngine["Out-of-Sample Holdout Evaluator"]
        MultiStep["Recursive Multi-Step Predictor"]
    end

    %% Interactions
    UI -->|HTTPS / Axios| API
    API --> AuthMW
    API --> MarketService
    API --> MLProxy
    
    MarketService --> DB_Stocks
    MarketService --> DB_Prices
    API --> DB_Users
    API --> DB_Watchlists
    API --> DB_Predictions
    API --> DB_Evals

    MLProxy -->|Internal JSON RPC / HTTP| ML_API
    ML_API --> DataLoader
    DataLoader --> FeatureEng
    FeatureEng --> ModelZoo
    ModelZoo --> EvalEngine
    ModelZoo --> MultiStep
    MultiStep --> ML_API
```

---

## 2. Request and Response Lifecycle

### A. Prediction Request Flow
1. **User Action**: The client selects stock symbol `AAPL`, model `Random Forest`, and horizon `5 Trading Days` in the AI Prediction Studio.
2. **Gateway Dispatch**: Axios issues `POST /api/predictions` with JWT authentication in the header.
3. **Authentication & Validation**: Express verifies the token (or allows optional guest exploration) and validates horizon ∈ {1, 5, 20}.
4. **ML Proxy Forwarding**: Express dispatches `POST http://localhost:8000/predict` to the Python microservice.
5. **Causal Preprocessing**:
   - Python loads historical bars from cache or Yahoo Finance.
   - Computes causal features (SMA ratios, RSI 14, MACD, Bollinger Bands, Volatility).
6. **Inference & Interval Generation**:
   - Loaded `.joblib` model recursively forecasts $t+1, \dots, t+5$.
   - Computes 95% standard error confidence envelopes ($1.96 \times RMSE \times \sqrt{step}$).
7. **Storage & Response**:
   - Python returns structured JSON containing forecasts, out-of-sample metrics, and feature importances.
   - Express persists the prediction audit to MongoDB Atlas `predictions` collection.
   - Client renders the historical-to-forecast comparison chart and feature contribution bars.

---

## 3. Database Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ WATCHLIST : owns
    USER ||--o{ PREDICTION : creates
    STOCK ||--o{ HISTORICAL_PRICE : contains
    STOCK ||--o{ WATCHLIST : referenced_by

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role
        object preferences
        date createdAt
    }

    STOCK {
        ObjectId _id PK
        string symbol UK
        string name
        string exchange
        string currency
        string sector
        float lastPrice
        float change
        float changePct
        date lastRefreshed
    }

    HISTORICAL_PRICE {
        ObjectId _id PK
        string symbol FK
        string date
        float open
        float high
        float low
        float close
        float adjClose
        int volume
        string dataSource
    }

    WATCHLIST {
        ObjectId _id PK
        ObjectId user FK
        string symbol
        string notes
        date createdAt
    }

    PREDICTION {
        ObjectId _id PK
        ObjectId user FK
        string symbol
        string modelName
        string modelVersion
        string forecastOriginDate
        float originClose
        int horizon
        array forecasts
        object metrics
        array featureImportance
        date createdAt
    }

    MODEL_EVALUATION {
        ObjectId _id PK
        string modelName
        string symbol
        object trainRange
        object testRange
        object metrics
        int sampleCount
        date evaluatedAt
    }
```

---

## 4. Time-Series Pipeline & Leakage Prevention

```mermaid
flowchart LR
    A["Raw Historical OHLCV Series"] --> B["Chronological Date Sort (Ascending)"]
    B --> C["Strict Chronological Split<br/>(Train: 80% | Unseen Holdout: 20%)"]
    
    subgraph TrainPartition ["Training Partition (Past)"]
        D["Causal Feature Engine"]
        E["Fit StandardScaler / Scalers"]
        F["Train Candidate Models"]
    end

    subgraph TestPartition ["Holdout Test Partition (Future)"]
        G["Transform with Fitted Scalers"]
        H["Evaluate Unseen Predictions"]
        I["Compute Holdout Metrics<br/>(MAE, RMSE, Dir Acc)"]
    end

    C -->|Train Dates| D
    D --> E --> F
    C -->|Test Dates| G
    F --> H
    G --> H --> I
```
