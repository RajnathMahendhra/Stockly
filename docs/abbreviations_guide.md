# Stockly: Master Project Abbreviations & Acronyms Guide (Viva Defense Reference)

This comprehensive reference document contains every single technical, financial, mathematical, and architectural abbreviation utilized in the **Stockly** platform. It is structured into high-clarity tables with formal definitions, application contexts within Stockly, and concise one-sentence viva explanations suitable for project review committees and mentors.

---

## Table of Contents
1. [Machine Learning, Deep Learning & Artificial Intelligence](#1-machine-learning-deep-learning--artificial-intelligence)
2. [Time-Series Forecasting & Statistical Evaluation Metrics](#2-time-series-forecasting--statistical-evaluation-metrics)
3. [Financial Markets, Equities & Trading Terminology](#3-financial-markets-equities--trading-terminology)
4. [Technical Indicators & Quantitative Mathematical Features](#4-technical-indicators--quantitative-mathematical-features)
5. [Full-Stack Web Architecture, APIs & Microservices (MERN + FastAPI)](#5-full-stack-web-architecture-apis--microservices-mern--fastapi)
6. [Database Management, Security & Cloud Infrastructure](#6-database-management-security--cloud-infrastructure)

---

## 1. Machine Learning, Deep Learning & Artificial Intelligence

| Abbreviation | Full Form | Meaning & Application in Stockly | Quick Explanation for Your Mentor |
| :--- | :--- | :--- | :--- |
| **AI** | Artificial Intelligence | The overarching scientific domain of creating algorithms capable of human-like predictive reasoning. | *"We apply AI through statistical learning and neural networks to predict multi-day stock price trajectories."* |
| **ML** | Machine Learning | Algorithms that learn patterns from historical financial data without being explicitly hardcoded. | *"Stockly uses supervised regression ML models trained on historical price and volume indicators."* |
| **DL** | Deep Learning | Multi-layered artificial neural network architectures capable of feature extraction from raw sequential data. | *"We implement Deep Learning via Recurrent LSTM networks to capture long-term sequential temporal dependencies."* |
| **LSTM** | Long Short-Term Memory | A specialized Recurrent Neural Network (RNN) with gating units (forget, input, output gates) to eliminate vanishing gradients. | *"LSTM preserves temporal context across past sequential trading days without suffering from vanishing gradients."* |
| **RNN** | Recurrent Neural Network | A class of neural networks where outputs from previous time steps are fed back as internal state inputs. | *"RNNs are designed for sequential time-series, and LSTM is our advanced gated RNN implementation."* |
| **RF** | Random Forest Regressor | An ensemble learning technique constructing a collection of de-correlated decision trees with bootstrap aggregation (bagging). | *"Random Forest averages predictions across 100 decision trees to reduce variance and prevent overfitting."* |
| **XGBoost** | Extreme Gradient Boosting | An optimized distributed gradient boosted decision tree library that sequentially minimizes residual errors with second-order gradients. | *"XGBoost sequentially fits new trees to the residual errors of preceding trees using L1/L2 regularization."* |
| **LR** | Linear Regression (Ridge) | A parametric regression model applying an L2 Tikhonov penalty on feature weights to avoid multicollinearity. | *"Ridge Linear Regression provides an interpretable baseline by shrinking indicator weights to avoid multicollinearity."* |
| **MDI** | Mean Decrease in Impurity | Feature importance scoring calculated by the total variance reduction brought by that feature across all tree splits. | *"MDI quantifies which technical indicators (like RSI or SMA) contributed most significantly to the model's split decisions."* |
| **XAI** | Explainable Artificial Intelligence | Methods and user interfaces that explain how and why black-box ML models arrive at specific predictions. | *"Our Prediction Studio includes an XAI panel showing top feature importances and indicator weight rankings."* |
| **OOD** | Out-of-Distribution | When test data displays statistical shifts (regime changes) not present in the historical training set. | *"Financial markets experience regime shifts, so we evaluate models on out-of-distribution holdout periods."* |
| **BPTT** | Backpropagation Through Time | The gradient descent optimization algorithm used to update LSTM weights across unfolded sequential time steps. | *"BPTT computes gradient error flow backward through past sequence lookback windows during LSTM training."* |
| **ReLU** | Rectified Linear Unit | Non-linear activation function ($f(x) = \max(0, x)$) used in deep learning layers. | *"ReLU introduces non-linearity into dense layers while allowing fast, non-saturating gradient propagation."* |
| **tanh** | Hyperbolic Tangent | S-shaped non-linear activation function mapping real inputs into the bounded range $[-1, 1]$. | *"LSTM memory cells utilize tanh to regulate the internal cell candidate state within bounded positive and negative values."* |
| **OOB** | Out-Of-Bag Error | Validation metric in Random Forest calculated on data points omitted from the bootstrap sample. | *"OOB provides an internal cross-validation estimate during Random Forest ensemble construction."* |

---

## 2. Time-Series Forecasting & Statistical Evaluation Metrics

| Abbreviation | Full Form | Meaning & Application in Stockly | Quick Explanation for Your Mentor |
| :--- | :--- | :--- | :--- |
| **MAE** | Mean Absolute Error | The average magnitude of prediction errors: $\frac{1}{n}\sum \|y_i - \hat{y}_i\|$. Measured in currency ($ or ₹). | *"MAE measures the average dollar deviation between our model's predicted closing prices and actual market closes."* |
| **RMSE** | Root Mean Squared Error | The square root of the mean squared error: $\sqrt{\frac{1}{n}\sum (y_i - \hat{y}_i)^2}$. Heavily penalizes large outliers. | *"RMSE heavily penalizes large forecast outliers, showing how sensitive each model is to sudden market spikes."* |
| **MSE** | Mean Squared Error | The average of the squared prediction deviations before taking the square root. | *"MSE serves as the internal mathematical loss function minimized during gradient descent and tree splitting."* |
| **MAPE** | Mean Absolute Percentage Error | Relative error normalized by actual price: $\frac{100\%}{n}\sum \|\frac{y_i - \hat{y}_i}{y_i}\|$. Scale-independent. | *"MAPE expresses forecasting error as a percentage, enabling fair accuracy comparisons across different stocks."* |
| **DA** | Directional Accuracy | The percentage of periods where the model correctly predicted whether the stock went UP or DOWN. | *"Directional Accuracy measures trend hit ratio, indicating whether the model correctly foresaw market direction."* |
| **$R^2$** | Coefficient of Determination | Statistical score representing the proportion of variance in the dependent variable explained by the features. | *"$R^2$ indicates how much of the historical price variance is explained by our technical indicator features."* |
| **CI** | Confidence Interval | A statistical range around the forecast expected to contain the true value with a specified probability (e.g., 95%). | *"Our charts display a 95% Confidence Interval band based on recursive forecast standard errors."* |
| **SE** | Standard Error | The standard deviation of the sampling distribution of a predictive statistic. | *"Standard error quantifies residual forecast uncertainty and widens as the projection horizon extends further."* |
| **H** | Forecast Horizon | The forward-looking time step step count ($H \in \{1, 5, 20\}$ trading days). | *"Horizon $H$ represents whether the user is forecasting 1 day, 1 week (5 days), or 1 month (20 days) ahead."* |
| **ARIMA** | Autoregressive Integrated Moving Average | Classical linear statistical benchmark time-series algorithm combining autoregression, differencing, and moving averages. | *"ARIMA is a classic statistical benchmark, which we compare against non-linear ML approaches like Random Forest."* |

---

## 3. Financial Markets, Equities & Trading Terminology

| Abbreviation | Full Form | Meaning & Application in Stockly | Quick Explanation for Your Mentor |
| :--- | :--- | :--- | :--- |
| **OHLCV** | Open, High, Low, Close, Volume | The five fundamental data points comprising every daily candlestick/bar in financial markets. | *"OHLCV represents the session open, session peak, session trough, closing settlement price, and total shares traded."* |
| **Adj Close** | Adjusted Closing Price | The closing price retroactively adjusted for corporate actions such as stock splits, dividends, and rights offerings. | *"We train our models on Adjusted Close to prevent artificial price drops caused by stock splits from corrupting calculations."* |
| **NSE** | National Stock Exchange | The premier modern electronic stock exchange of India (e.g. `RELIANCE.NS`, `TCS.NS`, `INFY.NS`). | *"Stockly supports Indian equities traded on the National Stock Exchange of India using Indian Rupee (INR) pricing."* |
| **BSE** | Bombay Stock Exchange | The oldest stock exchange in Asia, headquartered at Dalal Street, Mumbai, India. | *"BSE is the historic exchange of India, supported in Stockly's catalog using ticker suffixes like `.BO`."* |
| **NASDAQ** | National Association of Securities Dealers Automated Quotations | Major American electronic stock exchange heavily focused on global technology equities (e.g. `AAPL`, `MSFT`, `NVDA`). | *"NASDAQ is the primary US technology exchange from which Stockly streams global leaders like Apple and Nvidia."* |
| **NYSE** | New York Stock Exchange | The world's largest physical and electronic equities exchange by market capitalization, located on Wall Street. | *"NYSE provides trading for major multinational blue-chip equities in the Stockly database."* |
| **SEC** | Securities and Exchange Commission | The federal regulatory authority overseeing securities and financial markets in the United States. | *"The SEC mandates public disclosures and regulates US market data reporting standards."* |
| **SEBI** | Securities and Exchange Board of India | The primary regulatory agency for securities and commodity markets in India. | *"SEBI oversees exchange trading integrity and investor protection across Indian capital markets."* |
| **Ticker / Sym** | Ticker Symbol | A unique arrangement of alphanumeric characters representing a publicly traded security on an exchange. | *"Tickers are canonical identifiers, such as `AAPL` for Apple Inc. or `RELIANCE.NS` for Reliance Industries on NSE."* |
| **ETF** | Exchange-Traded Fund | An investment fund traded on stock exchanges holding a basket of assets (e.g., S&P 500 index fund). | *"An ETF pools diversified assets into a single tradeable security, which Stockly can analyze just like single stocks."* |
| **IPO** | Initial Public Offering | The first public sale of company shares on a stock exchange to institutional and retail investors. | *"An IPO marks a company's debut on an exchange, establishing the beginning of its publicly available OHLCV data."* |
| **P/E** | Price-to-Earnings Ratio | Valuation ratio measuring a company's current share price relative to its per-share earnings. | *"P/E ratio indicates whether an equity is trading at a premium or discount relative to corporate net income."* |
| **EPS** | Earnings Per Share | A company's net profit divided by the outstanding number of common shares. | *"EPS measures company profitability per share, a fundamental metric complementary to our technical price signals."* |
| **CAGR** | Compound Annual Growth Rate | The annualized geometric mean rate of return over a specified period longer than one year. | *"CAGR measures smoothed annual investment returns, dampening the volatile day-to-day fluctuations of the market."* |
| **BPS** | Basis Points | A unit of measurement equal to $\frac{1}{100}$th of 1% ($0.01\%$). | *"Financial spreads and percentage shifts are measured in basis points to avoid decimal ambiguities."* |
| **EOD** | End of Day | Market settlement data recorded after the closing bell at the conclusion of regular market trading hours. | *"Stockly's automated data ingestion acquires EOD bars containing finalized daily trading volume and closing prices."* |

---

## 4. Technical Indicators & Quantitative Mathematical Features

| Abbreviation | Full Form | Meaning & Application in Stockly | Quick Explanation for Your Mentor |
| :--- | :--- | :--- | :--- |
| **SMA** | Simple Moving Average | The unweighted arithmetic mean of closing prices over a rolling lookback window of $k$ periods. | *"SMA smooths out random price noise to reveal medium and long-term trend direction (we compute SMA-20 and SMA-50)."* |
| **EMA** | Exponential Moving Average | A moving average applying exponentially decreasing weights to older prices, placing higher emphasis on recent data. | *"EMA reacts more rapidly to recent price moves than SMA by applying an exponential multiplier $k = \frac{2}{N+1}$."* |
| **RSI** | Relative Strength Index | A bounded momentum oscillator $[0, 100]$ developed by J. Welles Wilder measuring the velocity and magnitude of price changes. | *"RSI measures momentum on a 0-100 scale; readings over 70 indicate overbought conditions, while under 30 indicates oversold."* |
| **MACD** | Moving Average Convergence Divergence | A trend-following momentum indicator displaying the relationship between a 12-day EMA and a 26-day EMA. | *"MACD subtracts the 26 EMA from the 12 EMA to identify accelerating directional momentum and trend shifts."* |
| **BB** | Bollinger Bands | Envelopes plotted two standard deviations above and below a 20-day simple moving average. | *"Bollinger Bands establish dynamic volatility boundaries, encompassing ~95% of typical closing price action."* |
| **HV / Vol** | Historical Volatility | The annualized standard deviation of logarithmic daily price returns over a rolling 20-day window ($\sigma_{20} \times \sqrt{252}$). | *"Historical Volatility quantifies market risk by computing the annualized dispersion of log daily returns over 252 trading days."* |
| **EWM** | Exponentially Weighted Moving | A mathematical rolling computation where weights decay exponentially back in time. | *"We use pandas `ewm()` to calculate causal EMA and RSI features without lookahead bias."* |
| **1D, 5D, 20D** | 1-Day, 5-Day, 20-Day Horizons | The recursive forecasting projection intervals implemented in the Prediction Studio. | *"1D forecasts next-day close, 5D projects a full 1-week business cycle, and 20D estimates a 1-month outlook."* |
| **1M, 3M, 6M, 1Y** | 1 Month, 3 Months, 6 Months, 1 Year | Timeframe filters used on the interactive Price Movement area chart. | *"These period selectors control historical data depth, with 1M returning ~21 trading days and 1Y returning ~252 trading days."* |

---

## 5. Full-Stack Web Architecture, APIs & Microservices (MERN + FastAPI)

| Abbreviation | Full Form | Meaning & Application in Stockly | Quick Explanation for Your Mentor |
| :--- | :--- | :--- | :--- |
| **MERN** | MongoDB, Express.js, React.js, Node.js | The full-stack JavaScript technology stack driving the application presentation and business logic layers. | *"MERN is our full-stack architecture: React handles the client UI, Express/Node handles REST routing, and MongoDB stores data."* |
| **API** | Application Programming Interface | A standardized set of protocols and contracts through which software services exchange data. | *"Our frontend communicates with Express, and Express communicates with Python ML via structured JSON APIs."* |
| **REST** | Representational State Transfer | An architectural software style utilizing stateless HTTP methods (`GET`, `POST`, `PUT`, `DELETE`). | *"We designed stateless RESTful endpoints following standard HTTP verbs for authentication, stocks, and predictions."* |
| **CRUD** | Create, Read, Update, Delete | The four fundamental database operations supported by application persistent storage. | *"Stockly implements complete CRUD for watchlists, user preferences, and saved prediction audit records."* |
| **JSON** | JavaScript Object Notation | A lightweight, human-readable data interchange format standard across web microservices. | *"All payloads, model parameters, and market bars are transmitted between microservices as structured JSON objects."* |
| **HTTP / HTTPS** | Hypertext Transfer Protocol (Secure) | The underlying communication network protocol enabling encrypted web data transfer over TLS/SSL. | *"HTTPS ensures that API calls, user session tokens, and passwords remain encrypted in transit."* |
| **CORS** | Cross-Origin Resource Sharing | A browser security mechanism that restricts HTTP requests made to a different origin domain or port. | *"CORS headers are configured in Express and FastAPI to permit authorized cross-origin requests from our Vite frontend."* |
| **JWT** | JSON Web Token | A compact, URL-safe standard (RFC 7519) for transmitting verifiable claims between parties as a cryptographically signed payload. | *"JWT encodes authenticated user IDs with HMAC-SHA256 signatures, enabling stateless session verification."* |
| **SPA** | Single-Page Application | A web application that loads a single HTML page and dynamically updates contents without full page reloads. | *"Stockly is a React SPA powered by Vite and React Router, delivering instantaneous client-side page transitions."* |
| **CSR** | Client-Side Rendering | Rendering web application user interfaces inside the user's browser using JavaScript rather than on the server. | *"React executes CSR in the browser, fetching raw JSON data from our APIs to render interactive Recharts components."* |
| **SSR** | Server-Side Rendering | Rendering initial HTML on the server before transmitting it to the browser. | *"Unlike SSR which re-renders on every request, our decoupled CSR architecture offloads UI rendering to the client."* |
| **UI / UX** | User Interface / User Experience | The visual design, layouts, interactive components, and usability flow experienced by the end user. | *"Our UI/UX is built with Tailwind CSS, Lucide icons, and Recharts, offering responsive dark-mode financial analytics."* |
| **DOM** | Document Object Model | The object-oriented tree representation of the HTML document rendered inside a web browser. | *"React utilizes a Virtual DOM in memory to reconcile UI diffs before applying minimal batch updates to the real browser DOM."* |
| **CSS** | Cascading Style Sheets | Style sheet language used for specifying the visual presentation and layout of HTML elements. | *"We use Tailwind CSS, a utility-first CSS framework, for modern responsive layouts and consistent spacing."* |
| **ENV / .env** | Environment Configuration | Key-value configuration files containing environment-specific secrets, ports, and connection strings. | *"Sensitive credentials such as `MONGO_URI` and `JWT_SECRET` are kept in `.env` files and excluded from git."* |
| **MVC** | Model-View-Controller | Architectural pattern separating data models, user interface views, and business routing controllers. | *"Our Express backend follows the MVC design pattern: Mongoose models, REST controllers, and React UI views."* |
| **ASGI** | Asynchronous Server Gateway Interface | Modern Python asynchronous specification succeeding WSGI, allowing FastAPI to handle async coroutines. | *"FastAPI runs on Uvicorn, an ASGI web server supporting high-concurrency non-blocking Python endpoints."* |
| **WSGI** | Web Server Gateway Interface | Legacy synchronous Python web server calling specification (used in traditional Flask or Django apps). | *"ASGI is superior to legacy WSGI because it supports non-blocking asynchronous event loops (`async`/`await`)."* |

---

## 6. Database Management, Security & Cloud Infrastructure

| Abbreviation | Full Form | Meaning & Application in Stockly | Quick Explanation for Your Mentor |
| :--- | :--- | :--- | :--- |
| **DB** | Database | An organized, persistent electronic collection of structured or semi-structured data. | *"Stockly uses MongoDB Atlas cloud database to persist historical prices, user profiles, and prediction audits."* |
| **NoSQL** | Not Only SQL | Non-relational, document-oriented database architecture providing flexible schemas and horizontal scalability. | *"MongoDB is a NoSQL document database, allowing flexible JSON-like BSON schemas without rigid table migrations."* |
| **BSON** | Binary JSON | The high-performance binary-encoded serialization format used internally by MongoDB to store documents. | *"MongoDB stores our stock and prediction records as BSON, supporting extended data types like Dates and ObjectIDs."* |
| **ODM** | Object-Document Mapper | A programming library that maps JavaScript application objects to MongoDB document collections (e.g., Mongoose). | *"Mongoose serves as our ODM, enforcing schema validation, pre-save hashing hooks, and relationship population in Node."* |
| **ORM** | Object-Relational Mapper | Similar to ODM, but designed for relational SQL tables (e.g., Hibernate, SQLAlchemy, Prisma). | *"While relational databases use ORMs, our document-based MongoDB architecture utilizes Mongoose as an ODM."* |
| **ACID** | Atomicity, Consistency, Isolation, Durability | Four critical properties guaranteeing database transactions are processed reliably. | *"MongoDB supports multi-document ACID transactions, ensuring atomic updates when modifying user watchlists."* |
| **TTL** | Time To Live | A mechanism that automatically purges or expires data records after a defined elapsed duration. | *"MongoDB TTL indexes can automatically expire temporary cache bars or verification tokens after a set timeframe."* |
| **URI / URL** | Uniform Resource Identifier / Locator | The standard address string identifying a specific network resource or database endpoint. | *"Our `MONGO_URI` connects the Express backend securely to our MongoDB Atlas cloud cluster via SRV DNS protocol."* |
| **NPM** | Node Package Manager | The default package manager for the JavaScript runtime environment Node.js. | *"NPM manages dependencies in both our client (`react`, `recharts`, `lucide-react`) and server (`express`, `mongoose`, `jsonwebtoken`)."* |
| **PyPI** | Python Package Index | The official third-party software repository for the Python programming language. | *"PyPI provides our machine learning libraries installed via pip (`scikit-learn`, `xgboost`, `fastapi`, `pandas`, `yfinance`)."* |
| **venv / .venv** | Virtual Environment | An isolated runtime directory containing a specific Python interpreter and sandboxed package dependencies. | *"A virtual environment prevents version conflicts between Stockly's ML dependencies and system-level Python packages."* |

---

## 7. Golden Viva Formula: How to Answer Any Technical Question

Whenever your guide or an external examiner asks: **"What does XYZ stand for and why did you use it?"**, structure your answer using this **3-Part Formula**:

1. **Part 1 (The Expansion)**: *"Sir/Ma'am, XYZ stands for [Full Form]."*
2. **Part 2 (The Function)**: *"In our project, its primary function is [describe what it does in 1 sentence]."*
3. **Part 3 (The Engineering Justification)**: *"We chose it over the alternatives because [state 1 key technical benefit, e.g., eliminates data leakage, non-blocking I/O, prevents overfitting, captures non-linear interactions]."*

### Example:
> **Guide:** *"What is LSTM and why didn't you just use simple RNN?"*  
> **Student:** *"Sir, **LSTM** stands for **Long Short-Term Memory**. In Stockly, it is used to capture long-term sequential dependencies across multi-day stock price lookback windows. We specifically implemented LSTM over standard vanilla RNN because standard RNNs suffer from vanishing and exploding gradients over long sequences, whereas LSTM's forget, input, and output gates enable the network to preserve gradients and learn patterns over extended time horizons."*
