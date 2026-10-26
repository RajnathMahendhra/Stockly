import React, { useState, useEffect } from 'react';
import {
  Layers,
  Award,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { modelService } from '../services/api';

const ModelComparisonPage = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [modelsData, setModelsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [error, setError] = useState('');
  const [sampleInfo, setSampleInfo] = useState(null);

  const modelKeys = ['naive_baseline', 'linear_regression', 'random_forest', 'xgboost', 'lstm'];

  const loadComparison = async () => {
    setLoading(true);
    setError('');
    try {
      const results = [];
      let dateMeta = null;

      for (const key of modelKeys) {
        try {
          const res = await modelService.getModelMetrics(key, symbol);
          if (res.data) {
            results.push({
              key,
              name: res.data.model_display_name,
              metrics: res.data.metrics,
              sampleCount: res.data.sample_count,
            });
            if (!dateMeta) {
              dateMeta = {
                dates: res.data.date_ranges,
                samples: res.data.sample_count,
              };
            }
          }
        } catch (e) {
          console.warn(`Metrics fetch failed for ${key}:`, e.message);
        }
      }

      setModelsData(results);
      setSampleInfo(dateMeta);
    } catch (err) {
      setError(err.message || 'Failed to load model comparison.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, [symbol]);

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      await modelService.trainModels(symbol, '2y', 0.2, true);
      await loadComparison();
    } catch (err) {
      alert(`Retraining failed: ${err.message}`);
    } finally {
      setRetraining(false);
    }
  };

  // Find best performing model on the out-of-sample holdout test set (lowest RMSE)
  let bestModel = null;
  if (modelsData.length > 0) {
    bestModel = modelsData.reduce((prev, curr) =>
      curr.metrics.rmse < prev.metrics.rmse ? curr : prev
    );
  }

  // Format data for comparison chart
  const chartData = modelsData.map((m) => ({
    name: m.name.split(' ')[0], // short name
    fullName: m.name,
    RMSE: m.metrics.rmse,
    MAE: m.metrics.mae,
    'Dir Accuracy (%)': m.metrics.directional_accuracy,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Retrain Trigger Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-400" />
              Model Comparison Leaderboard
            </h1>
            <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              Holdout Validation
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Scientifically defensible comparison on an identical unseen holdout evaluation period.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="px-3 py-2 bg-[#111622] text-xs text-white font-mono rounded-xl border border-[#1e2638] focus:outline-none"
          >
            <option value="AAPL">AAPL (Apple Inc.)</option>
            <option value="NVDA">NVDA (NVIDIA Corp.)</option>
            <option value="MSFT">MSFT (Microsoft)</option>
            <option value="RELIANCE.NS">RELIANCE.NS (NSE India)</option>
            <option value="TCS.NS">TCS.NS (NSE India)</option>
          </select>

          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            {retraining ? 'Retraining...' : 'Retrain Pipeline'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label={`Evaluating all candidate models for ${symbol}...`} />
      ) : (
        <>
          {/* Best Model Banner */}
          {bestModel && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                    Empirical Winner (Holdout Test Set)
                  </span>
                  <h3 className="text-xl font-bold text-white">{bestModel.name}</h3>
                  <p className="text-xs text-slate-400">
                    Achieved lowest out-of-sample RMSE of ${bestModel.metrics.rmse?.toFixed(2)} and directional accuracy of {bestModel.metrics.directional_accuracy?.toFixed(1)}%.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Outperforms Naive Baseline
              </div>
            </div>
          )}

          {/* Model Leaderboard Table */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-[#1e2638] flex justify-between items-center">
              <div>
                <h4 className="text-sm font-semibold text-white">Out-of-Sample Performance Table</h4>
                {sampleInfo?.dates && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Chronological holdout period: {sampleInfo.dates.test_start} to {sampleInfo.dates.test_end} ({sampleInfo.samples} observations)
                  </p>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b0f19] text-slate-400 uppercase tracking-wider border-b border-[#1e2638]">
                  <tr>
                    <th className="py-3.5 px-4">Algorithm</th>
                    <th className="py-3.5 px-4 text-right">Holdout MAE</th>
                    <th className="py-3.5 px-4 text-right">Holdout RMSE</th>
                    <th className="py-3.5 px-4 text-right">Directional Acc.</th>
                    <th className="py-3.5 px-4 text-right">Safe MAPE</th>
                    <th className="py-3.5 px-4 text-center">Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2638] text-slate-300">
                  {modelsData.map((m, idx) => {
                    const isWinner = bestModel && bestModel.key === m.key;
                    return (
                      <tr
                        key={m.key}
                        className={`hover:bg-slate-800/30 transition ${
                          isWinner ? 'bg-emerald-500/5 font-medium' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            {m.name}
                            {isWinner && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono">
                                Best
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{m.key}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                          ${m.metrics.mae?.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          ${m.metrics.rmse?.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-300">
                          {m.metrics.directional_accuracy?.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                          {m.metrics.mape?.toFixed(2)}%
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="w-6 h-6 rounded-full inline-flex items-center justify-center bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                            #{idx + 1}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparative Metrics Bar Chart */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-1">
              Side-by-Side Model Evaluation
            </h4>
            <p className="text-[11px] text-slate-400 mb-4">
              Comparing Root Mean Squared Error (lower is better) against Directional Accuracy % (higher is better).
            </p>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2233" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b0f19',
                      borderColor: '#1e2638',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="RMSE" fill="#f43f5e" radius={[4, 4, 0, 0]} name="RMSE (Lower is Better)" />
                  <Bar dataKey="MAE" fill="#f59e0b" radius={[4, 4, 0, 0]} name="MAE (Lower is Better)" />
                  <Bar dataKey="Dir Accuracy (%)" fill="#10b981" radius={[4, 4, 0, 0]} name="Directional Accuracy % (Higher is Better)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Academic Notes on Financial Metrics */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Academic Note for Viva Review: Why R² and MAPE Require Careful Interpretation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 leading-relaxed">
              <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#1e2638] space-y-1.5">
                <h5 className="font-semibold text-slate-200">The Problem with R² in Financial Price Levels</h5>
                <p>
                  Raw stock prices exhibit high autocorrelation ($Close_t \approx Close_{t-1}$).
                  Regressing non-stationary price series produces deceptively high $R^2$ scores (&gt;0.90) even for simple naive models.
                  Directional Accuracy and RMSE on out-of-sample holdout test sets provide a far more reliable gauge of predictive power.
                </p>
              </div>

              <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#1e2638] space-y-1.5">
                <h5 className="font-semibold text-slate-200">Safe MAPE Computation</h5>
                <p>
                  Mean Absolute Percentage Error divides by observed prices. If an asset trades near penny levels or approaches zero, MAPE explodes mathematically.
                  Stockly applies safe non-zero bounding to prevent numerical distortion.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelComparisonPage;
