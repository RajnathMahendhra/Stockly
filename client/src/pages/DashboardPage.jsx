import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Activity,
  BarChart2,
  Bookmark,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import PriceAreaChart from '../components/charts/PriceAreaChart';
import IndicatorChart from '../components/charts/IndicatorChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { stockService, predictionService, watchlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const POPULAR_TICKERS = [
  { symbol: 'AAPL', label: 'Apple' },
  { symbol: 'NVDA', label: 'NVIDIA' },
  { symbol: 'MSFT', label: 'Microsoft' },
  { symbol: 'GOOGL', label: 'Alphabet' },
  { symbol: 'RELIANCE.NS', label: 'Reliance' },
  { symbol: 'TCS.NS', label: 'TCS' },
  { symbol: 'INFY.NS', label: 'Infosys' },
];

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState(
    user?.preferences?.defaultStock || 'AAPL'
  );
  const [period, setPeriod] = useState('1y');
  const [stockData, setStockData] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [quickPrediction, setQuickPrediction] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');

  // Fetch stock data and technical indicators
  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const [historyRes, indRes] = await Promise.all([
          stockService.getStockHistory(selectedSymbol, period),
          stockService.getStockIndicators(selectedSymbol, '6mo'),
        ]);

        if (isMounted) {
          setStockData(historyRes.data);
          setIndicators(indRes.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load stock data. Ensure backend services are running.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [selectedSymbol, period]);

  // Load user's watchlist if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      watchlistService
        .getWatchlist()
        .then((res) => setWatchlist(res.data || []))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Quick prediction preview handler
  const handleRunQuickPrediction = async () => {
    setPredicting(true);
    try {
      const res = await predictionService.createPrediction(selectedSymbol, 'random_forest', 5, false);
      setQuickPrediction(res.data);
    } catch (err) {
      console.warn('Quick prediction error:', err.message);
    } finally {
      setPredicting(false);
    }
  };

  const latest = stockData?.latest || {};
  const currency = stockData?.profile?.currency || (selectedSymbol.endsWith('.NS') ? 'INR' : 'USD');
  const currSym = currency === 'INR' ? '₹' : '$';

  // Latest indicator stats
  const latestInd = indicators[indicators.length - 1] || {};
  const rsi = latestInd.rsi14 || 50;
  const rsiStatus = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral Momentum';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Welcome & Quick Stock Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Market Intelligence Terminal</h1>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Historical OHLCV analysis, technical indicator evaluation, and AI-driven econometric forecasting.
          </p>
        </div>

        {/* Quick Ticker Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {POPULAR_TICKERS.map((t) => (
            <button
              key={t.symbol}
              onClick={() => setSelectedSymbol(t.symbol)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                selectedSymbol === t.symbol
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-[#111622] text-slate-300 border-[#1e2638] hover:border-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setSelectedSymbol(selectedSymbol)}
            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded font-semibold text-[11px]"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label={`Loading real historical data for ${selectedSymbol}...`} />
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={`${selectedSymbol} Close`}
              value={latest.close || 0}
              change={latest.change || 0}
              changePct={latest.change_pct || 0}
              prefix={currSym}
              subtitle={latest.date ? `As of ${latest.date}` : ''}
              icon={DollarSign}
            />
            <StatCard
              title="Daily Range"
              value={
                stockData?.history?.length
                  ? `${currSym}${stockData.history[stockData.history.length - 1].low?.toFixed(2)} - ${currSym}${stockData.history[stockData.history.length - 1].high?.toFixed(2)}`
                  : 'N/A'
              }
              subtitle="Session Low - High"
              icon={Activity}
            />
            <StatCard
              title="RSI (14-Day)"
              value={rsi.toFixed(1)}
              subtitle={rsiStatus}
              icon={BarChart2}
            />
            <StatCard
              title="Annualized Volatility"
              value={
                stockData?.history?.length
                  ? `${stockData.history[stockData.history.length - 1].volatility_20?.toFixed(1) || 24.5}%`
                  : 'N/A'
              }
              subtitle="20-day rolling log volatility"
              icon={TrendingUp}
            />
          </div>

          {/* Main Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PriceAreaChart
                data={stockData?.history || []}
                symbol={selectedSymbol}
                currency={currency}
                currentPeriod={period}
                onPeriodChange={(p) => setPeriod(p)}
              />
            </div>

            {/* Quick Prediction & AI Spotlight Widget */}
            <div className="space-y-6">
              <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">AI Quick Forecast</h4>
                      <p className="text-[11px] text-slate-400">5-Day Random Forest Projection</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                    v1.2
                  </span>
                </div>

                {quickPrediction ? (
                  <div className="space-y-3 mt-4 pt-3 border-t border-[#1e2638]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Forecast Origin:</span>
                      <span className="font-mono text-slate-200">
                        {currSym}{quickPrediction.origin_close?.toFixed(2)} ({quickPrediction.forecast_origin_date})
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">T+5 Target Price:</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        {currSym}{quickPrediction.forecasts[quickPrediction.forecasts.length - 1]?.predicted_close?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Holdout Directional Acc:</span>
                      <span className="font-mono text-indigo-300 font-semibold">
                        {quickPrediction.metrics?.directional_accuracy?.toFixed(1)}%
                      </span>
                    </div>

                    <Link
                      to={`/predict?symbol=${selectedSymbol}`}
                      className="w-full mt-2 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      Open Full Studio <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Run an instant out-of-sample multi-step forecast for {selectedSymbol} trained on chronological technical indicators.
                    </p>
                    <button
                      onClick={handleRunQuickPrediction}
                      disabled={predicting}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4" />
                      {predicting ? 'Computing Forecast...' : 'Generate 5-Day Forecast'}
                    </button>
                  </div>
                )}
              </div>

              {/* Watchlist Preview Widget */}
              <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-emerald-400" />
                    Saved Watchlist
                  </h4>
                  <Link to="/watchlist" className="text-[11px] text-emerald-400 hover:underline">
                    View All
                  </Link>
                </div>

                {watchlist.length > 0 ? (
                  <div className="divide-y divide-[#1e2638] text-xs">
                    {watchlist.slice(0, 4).map((w) => (
                      <div
                        key={w.symbol}
                        onClick={() => setSelectedSymbol(w.symbol)}
                        className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/20 px-1 rounded transition"
                      >
                        <div>
                          <span className="font-bold text-white block">{w.symbol}</span>
                          <span className="text-[10px] text-slate-400">{w.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-white block">${w.price?.toFixed(2)}</span>
                          <span
                            className={`text-[10px] font-semibold ${
                              w.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {w.changePct >= 0 ? '+' : ''}{w.changePct?.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No stocks in watchlist.{' '}
                    <Link to="/watchlist" className="text-emerald-400 hover:underline">
                      Add stocks
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technical Indicators Sub-panel */}
          <div className="pt-2">
            <IndicatorChart data={indicators} activeIndicator="rsi" />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
