# Stockly: Comprehensive Viva Examination & Defense Handbook

This handbook prepares the student for final-year major project review committees, technical external examiners, and faculty viva voce examinations.

---

## 1. Project Abstract

**Stockly: An AI-Driven Framework for Stock Market Analysis and Future Price Prediction** is an end-to-end full-stack platform integrating the MERN stack with a high-performance Python machine learning microservice. Stockly acquires genuine historical market data (US and Indian NSE/BSE equities), computes causal econometric indicators (SMA, EMA, RSI 14, MACD, Bollinger Bands, and annualized volatility), and evaluates five comparative forecasting algorithms: Naive Persistence Baseline, Ridge Linear Regression, Random Forest Regressor, XGBoost Regressor, and Long Short-Term Memory (LSTM) Recurrent Neural Networks. To eliminate forward lookahead bias and data leakage, Stockly implements a strict chronological holdout evaluation protocol. All models are benchmarked on out-of-sample data using Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Directional Accuracy (%). Experimental forecasts are visualized with 95% standard error confidence envelopes alongside an Explainable AI (XAI) feature contribution panel and persistent MongoDB Atlas portfolio watchlists.

---

## 2. Thirty Comprehensive Viva Voce Questions & Answers

### Part I: Architecture, MERN Stack & MongoDB

#### Q1: Why did you adopt a decoupled MERN + FastAPI microservice architecture rather than a single monolithic app?
**Answer:** In professional financial engineering, data acquisition and user session management require different execution environments than scientific computation.
- **Node.js/Express** is single-threaded, asynchronous, and non-blocking, making it ideal for I/O-intensive workloads: serving the React SPA, routing REST requests, managing JWT authentication, and querying MongoDB Atlas.
- **Python** is the global standard for scientific computing, vectorized linear algebra (NumPy, pandas), and machine learning (scikit-learn, XGBoost, TensorFlow).
Decoupling them via HTTP JSON microservice protocols allows both tiers to be developed, scaled, and containerized independently without blocking the Express event loop during CPU-intensive model training.

#### Q2: What MongoDB collections did you design, and why did you use compound indexes?
**Answer:** We implemented six distinct Mongoose models:
1. `User`: Manages authentication credentials (bcrypt hashed) and user UI preferences.
2. `Stock`: Stores stock ticker metadata, exchange information, and latest price markers.
3. `HistoricalPrice`: Stores daily historical OHLCV bars. Contains a unique compound index on `{ symbol: 1, date: 1 }` to guarantee no duplicate daily bars exist for any security.
4. `Watchlist`: Tracks user-specific tickers. Uses a compound index on `{ user: 1, symbol: 1 }` with a unique constraint so users cannot add the same stock twice.
5. `Prediction`: Audits user forecasts, storing model parameters, horizon, and confidence intervals.
6. `ModelEvaluation`: Stores out-of-sample holdout metrics for all models across evaluation dates.

#### Q3: How is authentication handled securely across the application?
**Answer:** Authentication uses JSON Web Tokens (JWT) signed with a server-side secret (`process.env.JWT_SECRET`) and a 7-day expiration time. Passwords are never stored in plaintext; they are salted and hashed using `bcryptjs` with 10 salt rounds in a Mongoose pre-save middleware. When a user logs in, the server generates a token sent in the response payload. The client attaches this token in the `Authorization: Bearer <token>` header on subsequent requests, which is intercepted and validated by our Express `protect` middleware.

#### Q4: How does your application prevent sensitive information leakage in production?
**Answer:**
1. Mongoose's `select: false` attribute excludes password hashes from standard queries.
2. Centralized error middleware catches exceptions and suppresses raw stack traces when `NODE_ENV === 'production'`.
3. Database credentials and JWT secrets are stored exclusively in `.env` files and omitted from version control via `.gitignore`.
4. CORS is configured to whitelist only the trusted client URL.

#### Q5: What is the purpose of the `/api/health` endpoint?
**Answer:** It allows devops tools, uptime monitors, and container orchestrators (e.g. Docker, Kubernetes, AWS ALB) to verify service availability and timestamp liveness without triggering expensive database reads or model calculations.

---

### Part II: Time-Series Methodology & Data Leakage Prevention

#### Q6: What is "data leakage" (lookahead bias) in financial machine learning, and why is it fatal?
**Answer:** Data leakage occurs when information from the target variable or future time periods inadvertently contaminates the model training process. In financial markets, if a model peeks into tomorrow's price (e.g. through a centered moving average or random dataset shuffling), it achieves artificially inflated accuracy (e.g. 99%) in testing, but fails catastrophically when deployed on unseen future market bars.

#### Q7: Why is standard K-Fold Cross Validation invalid for stock price prediction?
**Answer:** Standard K-Fold randomly permutes and shuffles rows. Financial time-series data is autocorrelated and ordered along a non-reversible time arrow ($t-1 \to t \to t+1$). Random shuffling places future data points ($t+5$) into the training set and past points ($t+2$) into the validation set, creating lookahead leakage. Stockly enforces chronological splitting (first 80% train, last 20% holdout test) without shuffling.

#### Q8: At what point in the pipeline are feature scalers (StandardScaler / MinMaxScaler) fitted?
**Answer:** Scalers are fitted **strictly on the training split only** (`scaler.fit_transform(X_train)`), and then applied to transform the test split (`scaler.transform(X_test)`). Fitting scalers on the full dataset before splitting leaks the mean and variance of the future test distribution into the past.

#### Q9: How are the technical indicator features constructed to guarantee causality?
**Answer:** Every indicator is computed with rolling or exponential lookbacks referencing strictly past or current observations ($t-k$ to $t$). Moving averages, RSI 14, MACD, and rolling volatility are causal; the target variable is shifted forward ($Close_{t+h}$), and all rows with rolling NaN artifacts are cleanly eliminated before splitting.

#### Q10: How does recursive multi-step forecasting work in Stockly?
**Answer:** For a 5-day horizon, the model first predicts $t+1$ using features up to $t$. The predicted price $\hat{y}_{t+1}$ is fed into the rolling feature buffer to recompute momentum and return lags, enabling the model to predict $t+2$, iterating until $t+5$. Confidence intervals expand with $\sqrt{h}$ to reflect accumulating uncertainty.

---

### Part III: Machine Learning Models & Algorithms

#### Q11: What is the role of Model A: The Naive Forecast Baseline?
**Answer:** Under the Efficient Market Hypothesis (EMH), asset prices follow a random walk where the best mathematical estimate of tomorrow's price is today's closing price: $\hat{y}_{t+1} = y_t$. The Naive Baseline establishes the minimum performance threshold. Any machine learning model that cannot beat the Naive Baseline's holdout RMSE or Directional Accuracy adds no predictive value.

#### Q12: Why did you implement Ridge Linear Regression instead of ordinary Ordinary Least Squares (OLS)?
**Answer:** Technical indicators are frequently collinear (e.g., SMA 10, SMA 20, and SMA 50 are strongly correlated). In standard OLS, multicollinearity destabilizes coefficient estimates, causing extreme variances. Ridge regression adds an $L_2$ penalty ($\alpha \sum w_i^2$) to the loss function, shrinking weights, stabilizing estimates, and mitigating overfitting.

#### Q13: How does the Random Forest Regressor work in your framework?
**Answer:** It is a bagged ensemble of 100 randomized decision trees. Each tree is trained on a bootstrap sample of the training data (sampling with replacement) and considers a random subset of features at each node split. The final prediction is the average across all 100 trees. This reduces model variance without increasing bias.

#### Q14: How does Random Forest calculate Feature Importance?
**Answer:** Using Mean Decrease in Impurity (MDI). At each split in each decision tree, the reduction in mean squared error (variance) is attributed to the chosen splitting feature. These reductions are summed across all trees and normalized to 100% to identify the primary predictive drivers.

#### Q15: How does XGBoost differ from Random Forest?
**Answer:**
- **Random Forest** trains independent trees in parallel using bagging (bootstrap aggregation) to reduce variance.
- **XGBoost** trains trees sequentially using boosting. Each new tree fits the residual errors (gradients) of the existing ensemble. It optimizes a regularized objective function using first and second-order Taylor expansions to prevent overfitting.

#### Q16: How does the LSTM model handle temporal dependencies?
**Answer:** Standard feedforward neural networks treat inputs independently. Long Short-Term Memory (LSTM) networks incorporate internal memory cells ($c_t$) regulated by three non-linear gates:
1. **Forget Gate**: Decides what historical context to discard.
2. **Input Gate**: Decides what new information to store in the cell state.
3. **Output Gate**: Determines the hidden state output ($h_t$).
This gating architecture allows LSTMs to retain context across sequential sliding lookback windows (30 days) without suffering from vanishing gradients.

#### Q17: What fallback was implemented in case deep learning libraries or XGBoost are unavailable on a target machine?
**Answer:** Stockly implements resilient software design:
- If `xgboost` is absent, the system falls back to `scikit-learn`'s `GradientBoostingRegressor`.
- If native TensorFlow encountered OS permission or driver issues, the system automatically routes the neural network slot through an `MLPRegressor` multi-layer perceptron so the application never crashes.

---

### Part IV: Evaluation Metrics & Academic Rigor

#### Q18: What is the difference between MAE and RMSE, and why report both?
**Answer:**
- **MAE (Mean Absolute Error)** measures the average magnitude of absolute errors: $\frac{1}{n} \sum |y - \hat{y}|$. It is intuitive and directly interpretable in dollar/rupee terms.
- **RMSE (Root Mean Squared Error)** squares errors before averaging: $\sqrt{\frac{1}{n}\sum (y - \hat{y})^2}$. Squaring gives disproportional weight to large errors, penalizing severe outlier mispredictions.

#### Q19: What is Directional Accuracy (%), and why is it crucial for trading?
**Answer:** Directional Accuracy measures whether the model correctly forecasted the sign of market movement:
$$\text{DA} = \frac{1}{n-1} \sum \mathbb{I}\left[\text{sign}(y_t - y_{t-1}) == \text{sign}(\hat{y}_t - y_{t-1})\right] \times 100\%$$
A model could have a low dollar RMSE but predict the wrong direction at every turning point, resulting in massive trading losses. Directional Accuracy above 54–56% on out-of-sample data is considered statistically significant in algorithmic trading.

#### Q20: Why can the R² (Coefficient of Determination) score be misleading for financial stock prices?
**Answer:** Because raw stock prices are non-stationary and exhibit strong autocorrelation with lagged prices ($Close_t \approx Close_{t-1}$), even a completely uninformative regression on raw prices will produce an $R^2 > 0.90$. High $R^2$ reflects the price trend autocorrelation rather than genuine predictive skill.

#### Q21: What is the limitation of MAPE near low prices?
**Answer:** Mean Absolute Percentage Error divides by the true price: $|(y - \hat{y}) / y|$. When an asset trades at low prices or approaches zero, division by small numbers inflates MAPE toward infinity. Stockly bounds the denominator with $\epsilon = 10^{-4}$ to ensure mathematical stability.

#### Q22: Why should a model never be declared superior based on training performance alone?
**Answer:** A complex model (like an unregularized Decision Tree or deep neural network) can easily memorize training data, achieving near-zero training error ($RMSE \approx 0$). However, on unseen future data, it overfits and fails. Scientific comparison must be performed strictly on an out-of-sample holdout test partition.

---

### Part V: Financial Engineering & Real-World Economics

#### Q23: What is the Efficient Market Hypothesis (EMH), and does Stockly claim to "beat" the market?
**Answer:** EMH (Eugene Fama, 1970) asserts that asset prices reflect all available information, making consistent risk-adjusted alpha impossible. Stockly explicitly does **not** claim guaranteed predictive accuracy or financial returns. It is an econometric evaluation platform designed to measure how well statistical indicators capture short-term momentum relative to random walk benchmarks.

#### Q24: What are the primary limitations of stock prediction using historical OHLCV data alone?
**Answer:**
1. **Exogenous Events**: Unexpected earnings reports, interest rate decisions by central banks, geopolitical events, and regulatory announcements cannot be anticipated from historical price charts alone.
2. **Regime Shifts**: Market volatility parameters change abruptly during crashes and liquidity crunches.
3. **Feedback Loops**: In live markets, large algorithmic orders impact the market price (slippage and market impact).

#### Q25: How does Stockly distinguish between market closures and missing data?
**Answer:** Stockly's data ingestion normalizes timestamps against business trading calendars, filtering out non-trading weekend days (Saturdays and Sundays) and exchange holidays rather than misinterpreting gaps as zero prices.

---

### Part VI: Software Engineering, Security & Testing

#### Q26: What automated tests did you implement to verify code reliability?
**Answer:**
1. **Machine Learning Pipeline Tests** (`ml-service/tests/test_pipeline.py`):
   - Verifies all feature columns are computed with zero NaN leakage.
   - Asserts strict chronological separation ($Date_{\text{train\_max}} < Date_{\text{test\_min}}$).
   - Validates fitting and evaluation of Baseline, Linear Regression, and Random Forest.
2. **Backend Unit & Service Tests** (`server/tests/api.test.js`):
   - Verifies stock catalog search for US and Indian securities.
   - Tests indicator calculations (SMA, RSI, MACD, Bollinger Bands).
   - Validates Mongoose schema constraints and password hashing.
3. **Frontend Production Build Test**: Verifies zero syntax errors or missing dependencies across all 2,500+ React modules.

#### Q27: How does your frontend handle network failures or ML service downtime?
**Answer:** The frontend implements loading spinners, skeleton screens, and error alert banners. If the Python microservice is offline, the Express backend serves cached MongoDB historical data and displays non-blocking informational messages.

#### Q28: How does Stockly support Indian NSE/BSE securities?
**Answer:** Stockly recognizes Yahoo Finance ticker extensions such as `.NS` (National Stock Exchange of India) and `.BO` (Bombay Stock Exchange). Securities such as `RELIANCE.NS`, `TCS.NS`, `INFY.NS`, and `HDFCBANK.NS` are automatically rendered with appropriate rupee currency symbols (`₹`), Indian market hours attribution, and localized company metadata.

#### Q29: What are three realistic future enhancements for Stockly?
**Answer:**
1. **Multimodal NLP Sentiment Integration**: Incorporating real-time news headlines and financial 10-K filings using transformer models (e.g. FinBERT).
2. **Reinforcement Learning Portfolio Optimization**: Training an RL agent (PPO or DDPG) to dynamically allocate capital between predicted assets subject to Sharpe ratio constraints.
3. **WebSocket Live Streaming**: Transitioning from polling/REST to bidirectional WebSockets for real-time tick-by-tick updates.

#### Q30: What is your closing defense statement summarizing the project's contribution?
**Answer:** Stockly demonstrates that robust machine learning for financial time series requires disciplined scientific methodology: strict chronological data partitioning to prevent lookahead leakage, causal technical feature engineering, benchmarking against naive random walk baselines, explainable feature importance, and production-grade full-stack architecture connecting React, Express, MongoDB Atlas, and Python FastAPI.
