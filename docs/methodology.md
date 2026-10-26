# Stockly: Machine Learning & Time-Series Methodology

## 1. Introduction to Financial Time-Series Forecasting

Stock market prices exhibit high non-stationarity, regime shifts, heavy-tailed return distributions, and time-varying volatility (heteroskedasticity). Stockly models equity prices through causal technical and momentum features while enforcing strict econometric guardrails against lookahead bias.

---

## 2. Mathematical Formulations of Engineered Features

All features in Stockly are causal: computed exclusively using observations up to and including time $t$, with zero access to future observations $t+1$.

### A. Simple Moving Average (SMA)
For a lookback period $k$:
$$\text{SMA}_k(t) = \frac{1}{k} \sum_{i=0}^{k-1} \text{Close}_{t-i}$$
Normalized relative to current price to achieve stationarity:
$$\text{Ratio}_{\text{SMA}_k}(t) = \frac{\text{Close}_t}{\text{SMA}_k(t)}$$

### B. Exponential Moving Average (EMA)
Assigns geometrically decreasing weights to older price bars:
$$\text{EMA}_k(t) = \alpha \cdot \text{Close}_t + (1 - \alpha) \cdot \text{EMA}_k(t-1), \quad \alpha = \frac{2}{k + 1}$$

### C. Relative Strength Index (RSI 14)
Measures the velocity and magnitude of directional price movements:
$$\text{RS}(t) = \frac{\text{EMA}_{14}(\text{Gain}_t)}{\text{EMA}_{14}(\text{Loss}_t)}$$
$$\text{RSI}_{14}(t) = 100 - \frac{100}{1 + \text{RS}(t)}$$
Where $\text{Gain}_t = \max(0, \text{Close}_t - \text{Close}_{t-1})$ and $\text{Loss}_t = \max(0, \text{Close}_{t-1} - \text{Close}_t)$.

### D. Moving Average Convergence Divergence (MACD)
$$\text{MACD Line}(t) = \text{EMA}_{12}(t) - \text{EMA}_{26}(t)$$
$$\text{Signal Line}(t) = \text{EMA}_9(\text{MACD Line})(t)$$
$$\text{MACD Histogram}(t) = \text{MACD Line}(t) - \text{Signal Line}(t)$$

### E. Bollinger Bands (20-Period, 2 Standard Deviations)
$$\mu_{20}(t) = \text{SMA}_{20}(t), \quad \sigma_{20}(t) = \sqrt{\frac{1}{20}\sum_{i=0}^{19} (\text{Close}_{t-i} - \mu_{20}(t))^2}$$
$$\text{Upper Band}(t) = \mu_{20}(t) + 2\sigma_{20}(t)$$
$$\text{Lower Band}(t) = \mu_{20}(t) - 2\sigma_{20}(t)$$
$$\%B(t) = \frac{\text{Close}_t - \text{Lower Band}(t)}{\text{Upper Band}(t) - \text{Lower Band}(t)}$$

### F. Annualized Historical Volatility
$$\text{Vol}_{20}(t) = \text{StdDev}\left(\ln\left(\frac{\text{Close}_t}{\text{Close}_{t-1}}\right)\right) \times \sqrt{252}$$

---

## 3. Strict Time-Series Splitting & Leakage Prevention

### A. The Flaw in Standard K-Fold Cross Validation
In cross-sectional datasets (e.g. image classification, tabular customer churn), samples are Independent and Identically Distributed (i.i.d.).
In time series, samples are autocorrelated and temporally ordered. Shuffling breaks the time arrow:
$$X_{\text{train}} \supset \{t+2, t+5\}, \quad X_{\text{test}} \supset \{t+1\}$$
The model peeks into the future to predict the past, artificially inflating evaluation metrics.

### B. Stockly's Chronological Holdout Architecture
1. **Chronological Sorting**: Raw data is sorted strictly by date ascending.
2. **Fixed Time Split**:
   - Training Set: First 80% chronologically ($t_1 \le t \le t_{\text{train}}$).
   - Holdout Test Set: Final 20% chronologically ($t_{\text{train}+1} \le t \le t_{\text{end}}$).
3. **Scaler Partitioning**: Preprocessing scalers (StandardScaler, MinMaxScaler) fit exclusively on $X_{\text{train}}$ and merely transform $X_{\text{test}}$.
4. **Target Construction**: Supervised targets $y_t = \text{Close}_{t+h}$ are constructed prior to splitting, ensuring that the boundary between training and testing has no overlaps.

---

## 4. Evaluation Metrics

### A. Mean Absolute Error (MAE)
$$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |y_i - \hat{y}_i|$$

### B. Root Mean Squared Error (RMSE)
$$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (y_i - \hat{y}_i)^2}$$

### C. Directional Accuracy (%)
$$\text{DA} = \frac{1}{N-1} \sum_{i=2}^N \mathbb{I}\left[\text{sign}(y_i - y_{i-1}) = \text{sign}(\hat{y}_i - y_{i-1})\right] \times 100\%$$

### D. Safe Mean Absolute Percentage Error (MAPE)
$$\text{MAPE} = \frac{100\%}{N} \sum_{i=1}^N \left|\frac{y_i - \hat{y}_i}{\max(|y_i|, 10^{-4})}\right|$$

---

## 5. Multi-Step Recursive Forecasting

For forecast horizons $H \in \{1, 5, 20\}$:
1. Predict step 1: $\hat{y}_{t+1} = f(X_t)$.
2. Update the feature buffer: Replace price lag with $\hat{y}_{t+1}$.
3. Predict step 2: $\hat{y}_{t+2} = f(X_{t+1})$.
4. Repeat until step $H$.
5. Compute confidence bounds:
   $$\text{Lower}_h = \max\left(0.5, \hat{y}_{t+h} - 1.96 \cdot \text{RMSE}_{\text{holdout}} \cdot \sqrt{h} \cdot 0.4\right)$$
   $$\text{Upper}_h = \hat{y}_{t+h} + 1.96 \cdot \text{RMSE}_{\text{holdout}} \cdot \sqrt{h} \cdot 0.4$$
   The $\sqrt{h}$ factor reflects standard Brownian motion error diffusion over expanding forecast horizons.
