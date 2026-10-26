import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  TrendingUp,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { predictionService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PredictionHistoryPage = () => {
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await predictionService.getPredictionHistory();
      setHistory(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve prediction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prediction record?')) return;
    try {
      await predictionService.deletePrediction(id);
      setHistory(history.filter((h) => h._id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-400" />
              Forecast Audit & Prediction History
            </h1>
            <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              MongoDB Audit Trail
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Immutable log of previously generated predictions. Historical forecasts are strictly preserved without lookahead rewriting.
          </p>
        </div>

        <Link
          to="/predict"
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Create New Forecast
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading saved prediction audits from MongoDB..." />
      ) : history.length === 0 ? (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-12 text-center space-y-3">
          <Database className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Saved Predictions Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't saved any AI forecasts yet. Generate and save forecasts in the AI Prediction Studio to track them here.
          </p>
          <Link
            to="/predict"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition mt-2"
          >
            Launch AI Studio <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((pred) => {
            const firstForecast = pred.forecasts?.[0];
            const finalForecast = pred.forecasts?.[pred.forecasts.length - 1];
            const originPrice = pred.originClose || 0;
            const finalPrice = finalForecast?.predictedClose || originPrice;
            const delta = finalPrice - originPrice;
            const isUp = delta >= 0;

            return (
              <div
                key={pred._id}
                className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 hover:border-slate-700 transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold font-mono text-white">
                      {pred.symbol}
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {pred.horizon}D Horizon
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mb-3">
                    Model: <strong className="text-slate-200">{pred.modelDisplayName || pred.modelName}</strong>
                  </div>

                  {/* Price metrics summary */}
                  <div className="grid grid-cols-2 gap-2 bg-[#0b0f19] p-3 rounded-xl border border-[#1e2638] text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Origin Price</span>
                      <span className="font-mono text-slate-300 font-bold">
                        ${originPrice.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Projected Target</span>
                      <span
                        className={`font-mono font-bold ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        ${finalPrice.toFixed(2)} ({isUp ? '+' : ''}${delta.toFixed(2)})
                      </span>
                    </div>
                  </div>

                  {/* Holdout performance snapshot */}
                  <div className="mt-3 pt-3 border-t border-[#1e2638] flex justify-between text-[11px] text-slate-400">
                    <span>Holdout RMSE: ${pred.metrics?.rmse?.toFixed(2) || 'N/A'}</span>
                    <span className="text-emerald-400 font-semibold">
                      Dir Acc: {pred.metrics?.directionalAccuracy?.toFixed(1) || 'N/A'}%
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1e2638] flex items-center justify-between text-[11px] text-slate-500">
                  <span>Saved: {new Date(pred.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/predict?symbol=${pred.symbol}`}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition"
                      title="Run new forecast on this stock"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </Link>
                    {isAuthenticated && (
                      <button
                        onClick={() => handleDelete(pred._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PredictionHistoryPage;
