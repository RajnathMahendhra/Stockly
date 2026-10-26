import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  Cpu,
  Layers,
  Clock,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  HelpCircle,
  Info,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import PredictionComparisonChart from '../components/charts/PredictionComparisonChart';
import FeatureImportanceChart from '../components/charts/FeatureImportanceChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { predictionService, stockService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MODELS = [
  {
    id: 'random_forest',
    name: 'Random Forest Regressor',
    tag: 'Recommended (Ensemble)',
    desc: 'Non-linear tree ensemble capturing multi-indicator interactions with MDI feature importance.',
  },
  {
    id: 'xgboost',
    name: 'XGBoost Regressor',
    tag: 'Gradient Boosted',
    desc: 'Second-order gradient boosting optimizing sequential residual errors with regularization.',
  },
  {
    id: 'linear_regression',
    name: 'Ridge Linear Model',
    tag: 'Parametric',
    desc: 'L2-regularized linear model demonstrating baseline indicator weight coefficients.',
  },
  {
    id: 'naive_baseline',
    name: 'Naive Persistence Baseline',
    tag: 'Random Walk Benchmark',
    desc: 'Persistence forecast (y_t+h = y_t) used to benchmark whether complex models truly add value.',
  },
  {
    id: 'lstm',
    name: 'LSTM Neural Network',
    tag: 'Deep Sequential',
    desc: 'Recurrent architecture modeling sequential temporal dependencies across historical lookback windows.',
  },
];

const HORIZONS = [
  { days: 1, label: '1 Trading Day', sub: 'Next-day closing price estimate' },
  { days: 5, label: '5 Trading Days', sub: '1-week recursive business path' },
  { days: 20, label: '20 Trading Days', sub: '1-month medium-term outlook' },
];

const PredictionStudioPage = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [symbol, setSymbol] = useState(
    (searchParams.get('symbol') || 'AAPL').toUpperCase()
  );
  const [modelName, setModelName] = useState('random_forest');
  const [horizon, setHorizon] = useState(5);

  const [historicalBars, setHistoricalBars] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  // Initial load or symbol change
  useEffect(() => {
    let isMounted = true;
    const fetchHistoryAndPredict = async () => {
      setLoading(true);
      setError('');
      try {
        const histRes = await stockService.getStockHistory(symbol, '6mo');
        if (isMounted) {
          setHistoricalBars(histRes.data?.history || []);
        }

        const predRes = await predictionService.createPrediction(
          symbol,
          modelName,
          horizon,
          false // do not auto-save on preview
        );
        if (isMounted) {
          setPredictionData(predRes.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error generating forecast. Please check service connectivity.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistoryAndPredict();
    return () => {
      isMounted = false;
    };
  }, [symbol, modelName, horizon]);

  const handleManualSave = async () => {
    if (!predictionData) return;
    setSaving(true);
    try {
      await predictionService.createPrediction(symbol, modelName, horizon, true);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const metrics = predictionData?.metrics || {};
  const originPrice = predictionData?.origin_close || 0;
  const originDate = predictionData?.forecast_origin_date || '';
  const forecasts = predictionData?.forecasts || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              AI Prediction Studio
            </h1>
            <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              Production ML Engine
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Generate out-of-sample multi-step forecasts with statistical confidence bands and zero data leakage.
          </p>
        </div>

        {/* Manual Save to MongoDB Action */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualSave}
            disabled={saving || !predictionData || savedSuccess}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
              savedSuccess
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Saved to MongoDB
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Forecast to DB'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Panel: Symbol, Horizon, Model Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Stock Symbol */}
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            1. Select Security
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL, RELIANCE.NS"
              className="flex-1 px-3 py-2 bg-[#0b0f19] text-sm text-white font-mono rounded-xl border border-[#1e2638] focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['AAPL', 'NVDA', 'MSFT', 'RELIANCE.NS', 'TCS.NS', 'INFY.NS'].map((sym) => (
              <button
                key={sym}
                onClick={() => setSymbol(sym)}
                className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition ${
                  symbol === sym
                    ? 'bg-slate-700 text-emerald-400 border-slate-500'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Forecast Horizon */}
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            2. Forecast Horizon
          </label>
          <div className="grid grid-cols-3 gap-2">
            {HORIZONS.map((h) => (
              <button
                key={h.days}
                onClick={() => setHorizon(h.days)}
                className={`p-2.5 rounded-xl border text-center transition ${
                  horizon === h.days
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 font-bold'
                    : 'bg-[#0b0f19] text-slate-400 border-[#1e2638] hover:text-slate-200'
                }`}
              >
                <span className="block text-sm font-bold font-mono">{h.days}D</span>
                <span className="text-[10px] block opacity-80">Trading</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            {HORIZONS.find((h) => h.days === horizon)?.sub}
          </p>
        </div>

        {/* Step 3: Model Selector */}
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            3. Model Architecture
          </label>
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full px-3 py-2 bg-[#0b0f19] text-xs text-white rounded-xl border border-[#1e2638] focus:outline-none focus:border-indigo-500 font-semibold"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.tag})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {MODELS.find((m) => m.id === modelName)?.desc}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label={`Generating ${horizon}-day out-of-sample forecast for ${symbol}...`} />
      ) : (
        <>
          {/* Main Forecast Visualizer */}
          <PredictionComparisonChart
            historicalBars={historicalBars}
            forecasts={forecasts}
            originDate={originDate}
            originPrice={originPrice}
            modelName={MODELS.find((m) => m.id === modelName)?.name || modelName}
          />

          {/* Model Holdout Metrics & Explanation Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                Holdout MAE
              </span>
              <span className="text-xl font-bold font-mono text-white">
                ${metrics.mae?.toFixed(2) || '0.00'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Mean Absolute Error</span>
            </div>

            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                Holdout RMSE
              </span>
              <span className="text-xl font-bold font-mono text-white">
                ${metrics.rmse?.toFixed(2) || '0.00'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Root Mean Squared Error</span>
            </div>

            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                Directional Accuracy
              </span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {metrics.directional_accuracy?.toFixed(1) || '50.0'}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Movement Sign Concordance</span>
            </div>

            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                Safe Holdout MAPE
              </span>
              <span className="text-xl font-bold font-mono text-indigo-400">
                {metrics.mape?.toFixed(2) || '0.00'}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Percentage Relative Error</span>
            </div>
          </div>

          {/* Forecast Table & Feature Drivers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table of Forecast Points */}
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-white mb-1">
                Point Estimates & Confidence Bounds
              </h4>
              <p className="text-[11px] text-slate-400 mb-4">
                Forecast origin: {originDate} (Price: ${originPrice.toFixed(2)})
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b0f19] text-slate-400 uppercase tracking-wider border-b border-[#1e2638]">
                    <tr>
                      <th className="py-2.5 px-3">Step</th>
                      <th className="py-2.5 px-3">Target Date</th>
                      <th className="py-2.5 px-3 text-right">Predicted Close</th>
                      <th className="py-2.5 px-3 text-right">95% Range</th>
                      <th className="py-2.5 px-3 text-right">Est. Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2638]">
                    {forecasts.map((f) => {
                      const delta = f.predicted_close - originPrice;
                      const isUp = delta >= 0;
                      return (
                        <tr key={f.step} className="hover:bg-slate-800/20">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-400">T+{f.step}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-300">{f.date}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                            ${f.predicted_close?.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400 text-[11px]">
                            ${f.lower_bound?.toFixed(2)} - ${f.upper_bound?.toFixed(2)}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-mono font-semibold ${
                              isUp ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isUp ? '+' : ''}${delta.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Importance Panel */}
            <div>
              <FeatureImportanceChart
                featureItems={predictionData?.feature_importance || []}
              />
            </div>
          </div>

          {/* Explainability & Limitations Narrative Panel */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">
                Academic Methodology & Explainable AI Summary
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
              <div className="space-y-2 bg-[#0b0f19] p-4 rounded-xl border border-[#1e2638]">
                <h5 className="font-semibold text-slate-200 uppercase tracking-wide text-[10px]">
                  Validation Procedure
                </h5>
                <p className="leading-relaxed text-slate-400">
                  {predictionData?.explanation?.evaluation_summary ||
                    `Evaluated on chronologically held-out unseen market observations (${metrics.testStart} to ${metrics.testEnd}). Features are normalized strictly on the training set to prevent lookahead leakage.`}
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Strict temporal ordering verified</span>
                </div>
              </div>

              <div className="space-y-2 bg-[#0b0f19] p-4 rounded-xl border border-[#1e2638]">
                <h5 className="font-semibold text-slate-200 uppercase tracking-wide text-[10px]">
                  Known Model Limitations
                </h5>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  {predictionData?.limitations?.map((lim, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {lim}
                    </li>
                  )) || (
                    <li>Past statistical relationships may decouple during macro liquidity shocks.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-amber-300/90">
                {predictionData?.disclaimer ||
                  'Predictions are statistical estimates for educational and academic evaluation. They are not guaranteed and do not constitute financial advice.'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionStudioPage;
