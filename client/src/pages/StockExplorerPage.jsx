import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  Bookmark,
  TrendingUp,
  Activity,
  Calendar,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import PriceAreaChart from '../components/charts/PriceAreaChart';
import IndicatorChart from '../components/charts/IndicatorChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { stockService, watchlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StockExplorerPage = () => {
  const { symbol: routeSymbol } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [symbol, setSymbol] = useState((routeSymbol || 'AAPL').toUpperCase());
  const [period, setPeriod] = useState('1y');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [stockData, setStockData] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [savingWatchlist, setSavingWatchlist] = useState(false);

  // Sync route param with state
  useEffect(() => {
    if (routeSymbol) {
      setSymbol(routeSymbol.toUpperCase());
    }
  }, [routeSymbol]);

  // Load stock details & historical OHLCV data
  useEffect(() => {
    let isMounted = true;
    const loadStock = async () => {
      setLoading(true);
      setError('');
      try {
        const [historyRes, indRes] = await Promise.all([
          stockService.getStockHistory(symbol, period),
          stockService.getStockIndicators(symbol, '6mo'),
        ]);

        if (isMounted) {
          setStockData(historyRes.data);
          setIndicators(indRes.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || `Failed to fetch data for ${symbol}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStock();
    return () => {
      isMounted = false;
    };
  }, [symbol, period]);

  const handleSearchChange = async (val) => {
    setSearchQuery(val);
    if (val.trim()) {
      try {
        const res = await stockService.searchStocks(val);
        setSearchResults(res.data || []);
      } catch (e) {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelect = (sym) => {
    setSymbol(sym);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/stocks/${sym}`);
  };

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSavingWatchlist(true);
    try {
      await watchlistService.addToWatchlist(symbol);
      setIsSaved(true);
    } catch (err) {
      if (err.message.includes('already in your watchlist')) {
        setIsSaved(true);
      } else {
        alert(err.message);
      }
    } finally {
      setSavingWatchlist(false);
    }
  };

  const profile = stockData?.profile || {};
  const latest = stockData?.latest || {};
  const history = stockData?.history || [];
  const latestBar = history[history.length - 1] || {};
  const currency = profile.currency || (symbol.endsWith('.NS') ? 'INR' : 'USD');
  const currSym = currency === 'INR' ? '₹' : '$';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              Stock Explorer & Historical Feed
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Search and analyze global and Indian NSE/BSE securities with full OHLCV history.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticker or company name..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0b0f19] text-xs text-slate-100 rounded-xl border border-[#1e2638] focus:outline-none focus:border-indigo-500"
            />

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#111622] border border-[#1e2638] rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => handleSelect(item.symbol)}
                    className="w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-800/60 transition"
                  >
                    <div>
                      <div className="font-semibold text-xs text-white">{item.symbol}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{item.name}</div>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                      {item.exchange}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label={`Retrieving market data for ${symbol}...`} />
      ) : (
        <>
          {/* Stock Header & Actions Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#111622] border border-[#1e2638] rounded-2xl">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-extrabold text-white">{symbol}</h2>
                <span className="text-xs bg-slate-800 text-slate-300 font-medium px-2.5 py-0.5 rounded-full border border-slate-700">
                  {profile.exchange || 'NASDAQ'}
                </span>
                <span className="text-xs text-slate-400">• {profile.country || 'Global'}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">{profile.name}</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right mr-2">
                <div className="text-2xl font-bold font-mono text-white">
                  {currSym}{latest.close?.toFixed(2)}
                </div>
                <div
                  className={`text-xs font-semibold ${
                    latest.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {latest.change >= 0 ? '+' : ''}{latest.change?.toFixed(2)} ({latest.change_pct?.toFixed(2)}%)
                </div>
              </div>

              <button
                onClick={handleAddToWatchlist}
                disabled={savingWatchlist || isSaved}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isSaved
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                {isSaved ? 'In Watchlist' : 'Watchlist'}
              </button>

              <button
                onClick={() => navigate(`/predict?symbol=${symbol}`)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Forecast in Studio
              </button>
            </div>
          </div>

          {/* OHLCV Detailed Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">Open</span>
              <span className="text-sm font-bold font-mono text-white">{currSym}{latestBar.open?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">Session High</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{currSym}{latestBar.high?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">Session Low</span>
              <span className="text-sm font-bold font-mono text-rose-400">{currSym}{latestBar.low?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">Prev Close</span>
              <span className="text-sm font-bold font-mono text-slate-300">
                {currSym}{(latest.close - latest.change)?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="bg-[#111622] border border-[#1e2638] rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">Volume</span>
              <span className="text-sm font-bold font-mono text-indigo-400">
                {latestBar.volume ? (latestBar.volume / 1000000).toFixed(2) + 'M' : 'N/A'}
              </span>
            </div>
          </div>

          {/* Interactive Chart */}
          <PriceAreaChart
            data={history}
            symbol={symbol}
            currency={currency}
            currentPeriod={period}
            onPeriodChange={(p) => setPeriod(p)}
          />

          {/* Technicals */}
          <IndicatorChart data={indicators} activeIndicator="rsi" />
        </>
      )}
    </div>
  );
};

export default StockExplorerPage;
