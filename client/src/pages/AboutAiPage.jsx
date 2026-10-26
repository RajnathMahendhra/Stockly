import React from 'react';
import {
  Cpu,
  ShieldCheck,
  GitBranch,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

const AboutAiPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="border-b border-[#1e2638] pb-6">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
          Academic Documentation & Machine Learning Architecture
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          How Stockly AI Works: Methodology & Leakage Prevention
        </h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Comprehensive breakdown of econometric feature engineering, time-series holdout validation, and comparative predictive modeling.
        </p>
      </div>

      {/* Pipeline Flow Diagram */}
      <section className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          The End-to-End Prediction Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#1e2638] space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Step 01 • Ingestion
            </span>
            <h4 className="font-semibold text-white text-xs">Genuine Market Feed</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Historical OHLCV data acquired from genuine feeds (Yahoo Finance). Verified, sorted chronologically, and deduplicated.
            </p>
          </div>

          <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#1e2638] space-y-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Step 02 • Features
            </span>
            <h4 className="font-semibold text-white text-xs">Causal Engineering</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Computes SMA (10/20/50), RSI 14, MACD, Bollinger Bands, and return lags strictly using causal historical windows.
            </p>
          </div>

          <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#1e2638] space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Step 03 • Splitting
            </span>
            <h4 className="font-semibold text-white text-xs">Chronological Split</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              First 80% train, last 20% holdout test set. No random shuffling; feature scalers fit strictly on training set.
            </p>
          </div>

          <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#1e2638] space-y-2">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
              Step 04 • Inference
            </span>
            <h4 className="font-semibold text-white text-xs">Multi-Step Forecast</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Generates recursive 1, 5, or 20-day projections with 95% standard error confidence envelopes.
            </p>
          </div>
        </div>
      </section>

      {/* Prevention of Data Leakage (Critical Viva Requirement) */}
      <section className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">
            Mandatory Time-Series Methodology: Preventing Data Leakage
          </h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Standard cross-validation (such as K-Fold CV) shuffles observations randomly. In financial markets, random shuffling leaks future information into the past, producing artificially inflated accuracies that collapse in live deployment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#0b0f19] border border-rose-500/20 space-y-2">
            <h4 className="text-xs font-bold text-rose-400">Common Flaws in Novice Projects</h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li>Random train/test shuffling: model learns from tomorrow to predict yesterday.</li>
              <li>Fitting StandardScaler/MinMaxScaler on the full dataset before splitting.</li>
              <li>Calculating rolling indicators with centered windows (accessing future bars).</li>
              <li>Claiming 99% accuracy by evaluating models on training data alone.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#0b0f19] border border-emerald-500/20 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400">Stockly's Defensible Scientific Standards</h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li>Strict chronological date sorting without shuffling.</li>
              <li>Holdout test period remains completely unseen until evaluation.</li>
              <li>Scalers fit exclusively on the historical training partition.</li>
              <li>All 5 models are evaluated on the exact same out-of-sample dates.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Detailed Algorithm Explanations */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white">Model Architectures Implemented</h2>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">1. Naive Persistence Baseline (Benchmark)</h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Benchmark</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong>Mathematical Formulation:</strong> y_hat_{'{t+h}'} = y_t. The naive baseline assumes that the best predictor of tomorrow's price is today's closing price (Efficient Market Hypothesis random walk). Any machine learning algorithm that fails to beat the naive baseline's RMSE or Directional Accuracy on unseen data provides no economic utility.
            </p>
          </div>

          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">2. Ridge Regularized Linear Regression</h3>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">Parametric</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong>Mathematical Formulation:</strong> y_hat = w^T * x + b, minimizing Sum((y - y_hat)^2) + alpha * ||w||_2^2. L2 regularization prevents collinearity problems between highly correlated technical indicators (e.g. SMA 20 vs SMA 50). Provides transparent linear coefficients.
            </p>
          </div>

          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">3. Random Forest Regressor</h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Ensemble Trees</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong>Mechanism:</strong> Bagging ensemble of 100 randomized decision trees. Bootstrap aggregation reduces variance and mitigates individual tree overfitting. Computes Mean Decrease in Impurity (MDI) to rank which technical features contributed most to splitting variance reduction.
            </p>
          </div>

          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">4. XGBoost Regressor</h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Gradient Boosted</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong>Mechanism:</strong> Sequentially builds decision trees where each subsequent tree fits the negative gradient (residuals) of the existing ensemble. Utilizes second-order Taylor expansion approximations with L1/L2 tree complexity regularization.
            </p>
          </div>

          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">5. Long Short-Term Memory (LSTM) Neural Network</h3>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">Deep Learning</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              <strong>Architecture:</strong> Recurrent network featuring input, forget, and output gates that regulate gradient flow through an internal cell memory state across multi-day sequential sliding lookback windows (30 days). Mitigates vanishing gradient degradation over long sequences.
            </p>
          </div>
        </div>
      </section>

      {/* Honest Limitations for Viva Defense */}
      <section className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Honest Scientific Limitations (Viva Discussion Preparation)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          During viva examination, students often lose credibility by claiming their model "guarantees 95% profit". A senior engineer or faculty evaluator expects candidates to understand market limitations:
        </p>
        <ul className="text-xs text-slate-400 space-y-2 list-disc pl-5 leading-relaxed">
          <li>
            <strong>Non-stationarity:</strong> Financial time series do not adhere to fixed probability distributions; mean and variance drift across market regimes (bull, bear, consolidation).
          </li>
          <li>
            <strong>Exogenous macroeconomic shocks:</strong> Earnings surprises, central bank interest rate announcements, and geopolitical events cannot be derived solely from historical price bars.
          </li>
          <li>
            <strong>Multi-step recursive error compounding:</strong> Projecting 20 days forward accumulates prediction errors step-by-step, accurately represented by Stockly's widening 95% confidence envelope.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default AboutAiPage;
