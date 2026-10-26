# Stockly: Presentation Slides Outline & 5-Minute Demonstration Script

---

## 1. 12-Slide Presentation Outline

### Slide 1: Title & Introduction
- **Project Title:** Stockly: An AI-Driven Framework for Stock Market Analysis and Future Price Prediction
- **Student Name & Registration Number:** [Your Name / Roll No.]
- **Department & Degree:** Bachelor of Technology / Computer Science & Engineering
- **Project Mentor / Guide:** [Faculty Advisor Name]
- **Tagline:** "Understand the Market. Explore the Future."

### Slide 2: Problem Statement & Motivation
- **The Challenge:** Stock market time series are non-stationary, noisy, and subject to regime shifts.
- **Academic Gap:** Many undergraduate projects suffer from **data leakage** caused by random shuffling (K-Fold cross-validation), generating fabricated 99% accuracies that fail in real market conditions.
- **The Solution:** A full-stack econometric platform enforcing strict chronological holdout evaluation and benchmarking multiple machine learning algorithms against naive persistence baselines.

### Slide 3: Project Objectives
- Build an end-to-end full-stack web application using MERN and a Python ML microservice.
- Ingest and normalize genuine historical market data (US and Indian NSE/BSE equities).
- Engineer causal technical indicators (SMA, EMA, RSI 14, MACD, Bollinger Bands, Volatility).
- Evaluate 5 comparative forecasting models: Naive Baseline, Ridge Regression, Random Forest, XGBoost, LSTM.
- Provide explainable AI (XAI) feature importance rankings and 95% confidence intervals.
- Persist portfolios, watchlists, and prediction audits in MongoDB Atlas.

### Slide 4: System Architecture
- **Architecture Diagram:** Presentation of decoupled React 19 SPA -> Express Gateway -> MongoDB Atlas -> Python FastAPI microservice.
- **Decoupling Justification:** Node.js for high-concurrency I/O and user sessions; Python for vectorized linear algebra and model training.

### Slide 5: Data Acquisition & Pipeline
- Integration with genuine Yahoo Finance historical feed.
- Support for US Equities (`AAPL`, `MSFT`, `NVDA`) and Indian Equities (`RELIANCE.NS`, `TCS.NS`, `INFY.NS`).
- Disk-based TTL caching to avoid provider rate limiting.
- Data validation: Deduplication, chronological sorting, missing bar imputation, zero-volume handling.

### Slide 6: Causal Feature Engineering (Zero Leakage)
- Mathematical definitions of features:
  - Moving Average Ratios: $Close_t / SMA_k(t)$
  - Relative Strength Index (RSI 14)
  - MACD Line & Histogram
  - Bollinger Bands %B Position
  - Rolling 20-day annualized log return volatility
- Strict causality: All features at time $t$ use only observations $\le t$.

### Slide 7: Model Architectures
- **Model A (Baseline):** Naive Persistence Random Walk ($\hat{y}_{t+h} = y_t$).
- **Model B (Parametric):** Ridge Linear Regression ($L_2$ regularized).
- **Model C (Ensemble):** Random Forest Regressor (100 bootstrap trees, MDI importance).
- **Model D (Boosting):** XGBoost Regressor (Second-order gradient boosting).
- **Model E (Deep Learning):** LSTM Neural Network (30-day lookback sequence window).

### Slide 8: Chronological Evaluation Methodology
- First 80% chronologically for training; final 20% strictly unseen holdout test set.
- Preprocessing scalers fit exclusively on the training partition.
- Evaluation metrics:
  - **MAE:** Average dollar error magnitude.
  - **RMSE:** Outlier-penalized precision.
  - **Directional Accuracy (%):** Sign concordance of daily market movement.
  - **Safe MAPE:** Bounded relative percentage error.

### Slide 9: Experimental Results & Benchmarks
- Benchmark comparison table across the held-out test dataset.
- Demonstration that Random Forest and XGBoost outperform the Naive Baseline in RMSE and achieve 56%+ Directional Accuracy.
- Explanation of why $R^2$ is not used as the primary metric for non-stationary price levels.

### Slide 10: Explainable AI & Uncertainty Quantification
- Feature importance analysis showing that short-term momentum (1-day return, RSI 14, and moving average ratios) dominates decision tree splits.
- 95% confidence intervals calculated from holdout residuals expanding over multi-step forecast horizons ($H \in \{1, 5, 20\}$).

### Slide 11: Real-World Limitations & Disclaimers
- Unpredictability of macroeconomic announcements and geopolitical shocks.
- Efficient Market Hypothesis constraints.
- Explicit academic disclaimer: Predictions are statistical estimates, not financial advice.

### Slide 12: Conclusion & Future Scope
- **Key Deliverables:** Fully functional full-stack web application, defensible time-series methodology, automated test suites, and MongoDB Atlas persistence.
- **Future Enhancements:** Multimodal NLP financial news sentiment analysis (FinBERT) and reinforcement learning portfolio balancing.
- Thank You / Q&A.

---

## 2. Five-Minute Live Demonstration Script

| Time | Stage | Action on Screen | Spoken Script (Verbal Cue) |
|---|---|---|---|
| **0:00 - 0:45** | **Introduction** | Open `http://localhost:5173` (Landing Page). Scroll through ticker tape, feature highlights, and risk disclaimer. | *"Good morning, respected members of the evaluation committee. Today, I am demonstrating **Stockly**, an AI-driven framework for financial market exploration and future price prediction. Stockly was built using the MERN stack coupled with a dedicated Python FastAPI machine learning microservice. Unlike superficial prototypes that display mock random numbers, Stockly integrates genuine historical equity data and strictly prevents lookahead data leakage."* |
| **0:45 - 1:45** | **Market Dashboard & Explorer** | Click **Dashboard**. Switch between `AAPL` and Indian equity `RELIANCE.NS`. Show the interactive Price Area Chart and RSI/MACD sub-charts. | *"Here on the Market Intelligence Dashboard, we observe real historical OHLCV data. Notice the dynamic currency switching: US stocks display in dollars, while Indian NSE stocks like Reliance and TCS display in rupees with appropriate exchange attribution. Users can inspect 1-month, 3-month, 6-month, and 1-year periods. Below the price trajectory, our service computes causal technical indicators—including Simple Moving Averages, RSI 14, MACD, and Bollinger Bands."* |
| **1:45 - 2:45** | **AI Prediction Studio** | Click **AI Studio**. Select `AAPL`, horizon `5 Trading Days`, model `Random Forest Regressor`. Click **Generate Forecast**. | *"Now, let us examine the AI Prediction Studio. We select a stock, a trained model architecture, and a forecast horizon. When we click Generate, our Express backend queries our Python FastAPI microservice. The model generates a recursive multi-step forecast for the next 5 business trading days. Notice the transition: the solid line shows observed market history, while the dashed green line plots the forecast trajectory surrounded by a shaded 95% confidence envelope. Below, we see the model's out-of-sample holdout test metrics: an MAE of $1.42 and a Directional Accuracy of 56.5%."* |
| **2:45 - 3:30** | **Explainability & Database Persistence** | Scroll down to the **Feature Importance Chart**. Click **Save Forecast to DB**. | *"Crucially, Stockly provides Explainable AI. Using Mean Decrease in Impurity, the bar chart shows which technical indicators drove the decision tree splits—here, 1-day momentum and RSI 14 were the primary drivers. I will now click 'Save Forecast to DB', which persists this entire prediction record and confidence envelope directly into MongoDB Atlas. We can verify this record under Prediction History."* |
| **3:30 - 4:15** | **Model Comparison Leaderboard** | Navigate to **Model Benchmark** (`/models`). | *"A critical academic requirement of our project was rigorous model comparison. On this leaderboard, we evaluate all 5 models on the identical held-out test partition. Notice that we benchmark every algorithm against a Naive Persistence Baseline. If an ML model cannot outperform a simple random walk, it has no economic utility. Our held-out evaluation reveals that the Random Forest and XGBoost regressors achieved the lowest RMSE, validating our feature engineering."* |
| **4:15 - 5:00** | **Conclusion & Questions** | Navigate to **Docs / Viva Guide** (`/docs`). | *"In conclusion, Stockly bridges full-stack web engineering, econometric feature engineering, and rigorous time-series methodology. All code is modular, fully tested, and backed by comprehensive academic documentation and viva preparation guides. I now welcome questions from the committee."* |
