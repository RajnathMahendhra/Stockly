import React from 'react';
import { BookOpen, HelpCircle, Terminal, Cpu, Database, Award, Check } from 'lucide-react';

const GLOSSARY_ITEMS = [
  {
    term: 'MAE (Mean Absolute Error)',
    definition: 'The average magnitude of absolute forecasting errors: (1/n) * sum(|y - y_hat|). Expressed in the same currency units as the asset price.',
  },
  {
    term: 'RMSE (Root Mean Squared Error)',
    definition: 'The square root of the mean squared prediction error: sqrt((1/n) * sum((y - y_hat)^2)). Penalizes larger outlier prediction errors more severely than MAE.',
  },
  {
    term: 'Directional Accuracy (%)',
    definition: 'The percentage of periods in which the model correctly anticipates whether the asset price will increase or decrease relative to the previous day: sign(y_t - y_{t-1}) == sign(y_hat_t - y_{t-1}). Crucial for trading profitability.',
  },
  {
    term: 'Data Leakage (Lookahead Bias)',
    definition: 'An experimental mistake where information from future time periods inadvertently contaminates the training dataset (e.g. by random shuffling or fitting scalers across the full dataset).',
  },
  {
    term: 'Non-Stationarity',
    definition: 'The statistical property of financial time series where mean, variance, and covariance fluctuate over time, complicating long-term linear forecasting.',
  },
  {
    term: 'RSI (Relative Strength Index)',
    definition: 'A bounded momentum oscillator [0, 100] measuring the speed and change of price movements over 14 periods.',
  },
  {
    term: 'MACD',
    definition: 'Moving Average Convergence Divergence; calculates the difference between the 12-day and 26-day EMAs, accompanied by a 9-day signal line.',
  },
  {
    term: 'Recursive Multi-Step Forecasting',
    definition: 'Iterative technique where one-step ahead predictions are fed into the feature set to forecast successive steps (T+1 -> T+2 -> ... -> T+h).',
  },
];

const VIVA_QA = [
  {
    q: 'Why did you choose a MERN stack paired with a Python microservice rather than pure Python or pure Node.js?',
    a: 'Separation of concerns. The MERN stack (MongoDB, Express, React, Node.js) excels at high-concurrency user session handling, REST routing, real-time UI charting, and ODM data persistence. Python is the industry benchmark for scientific machine learning (scikit-learn, XGBoost, pandas, NumPy). Decoupling them via a lightweight REST microservice architecture (FastAPI) mirrors production SaaS architectures and allows independent scaling.',
  },
  {
    q: 'Why should we NOT use standard K-Fold Cross Validation for stock price forecasting?',
    a: 'Standard K-Fold randomly shuffles data points. Shuffling time-series observations introduces fatal data leakage where the model trains on future data points to predict past observations. Stockly enforces strictly chronological train/test splitting (first 80% train, last 20% holdout test) and fits all feature scalers strictly on training data.',
  },
  {
    q: 'Why does the Naive Baseline matter in your project?',
    a: 'According to the Efficient Market Hypothesis, stock prices closely resemble a random walk where tomorrow\'s expected price equals today\'s price. The Naive Baseline establishes a benchmark. If a machine learning model cannot achieve a lower RMSE or higher Directional Accuracy than the Naive Baseline, it provides zero economic value.',
  },
  {
    q: 'How does Random Forest compute Feature Importance?',
    a: 'Random Forest calculates Mean Decrease in Impurity (MDI). For each feature, it measures the total reduction in variance across all 100 decision trees caused by splits on that feature, normalized to 100%.',
  },
  {
    q: 'Why can R² be misleading when evaluating stock prices?',
    a: 'Because raw stock prices are non-stationary and exhibit strong autocorrelation with lagged prices, simple regressions on raw prices often show R² > 0.90 without having true predictive power. Out-of-sample RMSE, MAE, and Directional Accuracy are far more reliable.',
  },
];

const DocumentationPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="border-b border-[#1e2638] pb-6">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
          Final-Year Major Project Companion
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Stockly Documentation & Viva Defense Guide
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Academic reference handbook, operational architecture, and expected oral defense questions with model answers.
        </p>
      </div>

      {/* Quick Setup Commands */}
      <section className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          Service Startup Commands
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#1e2638] space-y-2">
            <span className="text-emerald-400 font-bold block text-[11px]">1. Express Backend (:5000)</span>
            <code className="text-slate-300 block bg-slate-900/60 p-2 rounded">
              cd server<br />npm run dev
            </code>
          </div>
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#1e2638] space-y-2">
            <span className="text-indigo-400 font-bold block text-[11px]">2. Python ML Microservice (:8000)</span>
            <code className="text-slate-300 block bg-slate-900/60 p-2 rounded">
              cd ml-service<br />python -m uvicorn app.main:app --reload
            </code>
          </div>
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#1e2638] space-y-2">
            <span className="text-amber-400 font-bold block text-[11px]">3. React Vite Frontend (:5173)</span>
            <code className="text-slate-300 block bg-slate-900/60 p-2 rounded">
              cd client<br />npm run dev
            </code>
          </div>
        </div>
      </section>

      {/* Top Viva Defense Q&A */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">
            Top Viva Oral Defense Questions & Answers
          </h2>
        </div>

        <div className="space-y-4">
          {VIVA_QA.map((item, idx) => (
            <div key={idx} className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-start gap-2">
                <span className="text-emerald-400 font-mono">Q{idx + 1}:</span>
                {item.q}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#0b0f19] p-4 rounded-xl border border-[#1e2638]">
                <strong className="text-indigo-300 block mb-1">Defense Response:</strong>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Financial & ML Glossary */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Key Terminology Glossary</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GLOSSARY_ITEMS.map((item, idx) => (
            <div key={idx} className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-1.5">
              <h4 className="text-xs font-bold text-white">{item.term}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.definition}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DocumentationPage;
