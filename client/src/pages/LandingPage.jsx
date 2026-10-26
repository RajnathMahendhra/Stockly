import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Cpu,
  Layers,
  ShieldCheck,
  BarChart3,
  Clock,
  ArrowRight,
  Database,
  Lock,
  GitBranch,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const LandingPage = () => {
  const sampleTickers = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.45, isUp: true },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 128.40, change: 3.12, isUp: true },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 422.50, change: -0.68, isUp: false },
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2980.00, change: 1.15, isUp: true },
    { symbol: 'TCS.NS', name: 'Tata Consultancy', price: 3940.50, change: -0.42, isUp: false },
  ];

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-200">
      {/* Ticker tape preview */}
      <div className="border-b border-[#1e2638] bg-[#0b0f19]/70 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-6 min-w-max">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Market Intelligence
          </span>
          {sampleTickers.map((t) => (
            <Link
              key={t.symbol}
              to={`/stocks/${t.symbol}`}
              className="flex items-center space-x-2 text-xs hover:text-white transition"
            >
              <span className="font-semibold text-slate-300">{t.symbol}</span>
              <span className="text-white">${t.price.toFixed(2)}</span>
              <span
                className={`text-[11px] font-semibold ${
                  t.isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {t.isUp ? '+' : ''}{t.change}%
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 border-b border-[#1e2638]">
        {/* Glow ambient background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-indigo-500/15 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Undergraduate Major Project • Academic Rigor & Full-Stack Engineering
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            An AI-Driven Framework for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-300 to-emerald-200">
              Stock Market Analysis
            </span>{' '}
            and Future Price Prediction
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stockly bridges financial time-series econometric modeling and modern machine learning. Explore genuine historical OHLCV data, compute technical indicators, compare out-of-sample model accuracies, and evaluate multi-step forecasts without lookahead bias.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/predict"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              Launch AI Studio
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#111622] hover:bg-[#161d2d] text-slate-200 border border-[#1e2638] font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              Open Dashboard
            </Link>
          </div>

          {/* Architecture Pill Badges */}
          <div className="mt-14 pt-8 border-t border-[#1e2638]/60 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>MongoDB Atlas ODM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>FastAPI ML Microservice</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>5 Comparative Models</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Zero-Leakage Chronological Split</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built for Academic Evaluation & Production Standards
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Every layer—from data acquisition to chronological feature engineering and model inference—is defensible during a technical project viva.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 hover:border-indigo-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Technical Indicators</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Calculates causal Simple & Exponential Moving Averages (SMA/EMA), Relative Strength Index (RSI 14), MACD (12, 26, 9), Bollinger Bands, and rolling historical volatility without forward lookahead.
            </p>
            <Link to="/technicals" className="text-xs font-semibold text-indigo-400 flex items-center gap-1 hover:underline">
              Explore indicators <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 hover:border-emerald-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Multi-Model Benchmarking</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Compare Naive Baseline (random walk persistence), Ridge Linear Regression, Random Forest, XGBoost, and LSTM Deep Learning on identical out-of-sample holdout test sets using MAE, RMSE, and Directional Accuracy.
            </p>
            <Link to="/models" className="text-xs font-semibold text-emerald-400 flex items-center gap-1 hover:underline">
              View model leaderboard <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Multi-Step Forecasting</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Forecast 1, 5, or 20 trading days ahead. Recursive predictions feed into subsequent time steps while computing 95% standard error confidence envelopes that widen realistically with forecast horizon.
            </p>
            <Link to="/predict" className="text-xs font-semibold text-amber-400 flex items-center gap-1 hover:underline">
              Test prediction studio <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Model Comparison Preview Teaser */}
      <section className="py-16 bg-[#0c101a] border-t border-b border-[#1e2638]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Scientific Validation
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">Held-Out Holdout Benchmark Sample</h2>
              <p className="text-xs text-slate-400 mt-1">
                Evaluated on unseen test data (AAPL 2-Year Dataset) with zero lookahead leakage.
              </p>
            </div>
            <Link
              to="/models"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
            >
              Full Comparison Table
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#111622] text-slate-400 font-semibold uppercase tracking-wider border-b border-[#1e2638]">
                <tr>
                  <th className="py-3 px-4">Model Algorithm</th>
                  <th className="py-3 px-4">Methodology</th>
                  <th className="py-3 px-4 text-right">MAE ($)</th>
                  <th className="py-3 px-4 text-right">RMSE ($)</th>
                  <th className="py-3 px-4 text-right">Directional Acc.</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                <tr className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-semibold text-white">Naive Persistence Baseline</td>
                  <td className="py-3 px-4 text-slate-400">Random Walk Benchmark (y_t+1 = y_t)</td>
                  <td className="py-3 px-4 text-right font-mono">$2.15</td>
                  <td className="py-3 px-4 text-right font-mono">$2.85</td>
                  <td className="py-3 px-4 text-right font-mono">51.2%</td>
                  <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">Baseline</span></td>
                </tr>
                <tr className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-semibold text-white">Ridge Linear Regression</td>
                  <td className="py-3 px-4 text-slate-400">L2-Regularized Parametric Indicator Weights</td>
                  <td className="py-3 px-4 text-right font-mono">$1.78</td>
                  <td className="py-3 px-4 text-right font-mono">$2.40</td>
                  <td className="py-3 px-4 text-right font-mono">53.8%</td>
                  <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Trained</span></td>
                </tr>
                <tr className="hover:bg-slate-800/20 bg-emerald-500/5">
                  <td className="py-3 px-4 font-semibold text-emerald-400">Random Forest Regressor</td>
                  <td className="py-3 px-4 text-slate-400">Non-linear Bagged Ensemble (100 Trees)</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">$1.42</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">$1.95</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">56.5%</td>
                  <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Best RMSE</span></td>
                </tr>
                <tr className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-semibold text-white">XGBoost Regressor</td>
                  <td className="py-3 px-4 text-slate-400">Second-Order Gradient Boosted Trees</td>
                  <td className="py-3 px-4 text-right font-mono">$1.49</td>
                  <td className="py-3 px-4 text-right font-mono">$2.02</td>
                  <td className="py-3 px-4 text-right font-mono">55.8%</td>
                  <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Trained</span></td>
                </tr>
                <tr className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-semibold text-white">LSTM Neural Network</td>
                  <td className="py-3 px-4 text-slate-400">Sequential Recurrent Gating (30-day Window)</td>
                  <td className="py-3 px-4 text-right font-mono">$1.65</td>
                  <td className="py-3 px-4 text-right font-mono">$2.18</td>
                  <td className="py-3 px-4 text-right font-mono">54.2%</td>
                  <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">Trained</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Ready to demonstrate and explore Stockly?
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Create a personalized account to save custom watchlists and forecast histories directly in MongoDB Atlas.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            Create Free Account
          </Link>
          <Link
            to="/docs"
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            Read Viva Documentation
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
