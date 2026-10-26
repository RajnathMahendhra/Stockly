import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Plus,
  Trash2,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { watchlistService, stockService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const WatchlistPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSymbol, setNewSymbol] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchWatchlist = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await watchlistService.getWatchlist();
      setWatchlist(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve watchlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [isAuthenticated]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    setAdding(true);
    setError('');
    try {
      await watchlistService.addToWatchlist(newSymbol.trim().toUpperCase(), notes);
      setNewSymbol('');
      setNotes('');
      await fetchWatchlist();
    } catch (err) {
      setError(err.message || 'Could not add stock to watchlist.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (symbol) => {
    try {
      await watchlistService.removeFromWatchlist(symbol);
      setWatchlist(watchlist.filter((item) => item.symbol !== symbol));
    } catch (err) {
      alert(`Could not remove ${symbol}: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-[#111622] border border-[#1e2638] rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In to View Watchlist</h2>
        <p className="text-xs text-slate-400">
          Your personalized watchlist is persistently stored in MongoDB Atlas across user sessions.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-emerald-400" />
              Personalized Watchlist
            </h1>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              MongoDB Atlas Persisted
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Monitor selected stocks and launch instant predictive forecast workflows.
          </p>
        </div>
      </div>

      {/* Add Stock Card */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Add Security to Watchlist</h3>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Symbol (e.g. AAPL, NVDA, RELIANCE.NS)"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-2.5 bg-[#0b0f19] text-xs text-white rounded-xl border border-[#1e2638] focus:outline-none focus:border-indigo-500 font-mono"
          />
          <input
            type="text"
            placeholder="Optional thesis note (e.g. AI momentum candidate)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#0b0f19] text-xs text-white rounded-xl border border-[#1e2638] focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {adding ? 'Adding...' : 'Add Stock'}
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading your saved watchlists from MongoDB..." />
      ) : watchlist.length === 0 ? (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-12 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add your favorite stocks above to track prices and quickly run time-series prediction models.
          </p>
        </div>
      ) : (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b0f19] text-slate-400 uppercase tracking-wider border-b border-[#1e2638]">
                <tr>
                  <th className="py-3.5 px-4">Symbol</th>
                  <th className="py-3.5 px-4">Company Name</th>
                  <th className="py-3.5 px-4">Exchange</th>
                  <th className="py-3.5 px-4 text-right">Latest Price</th>
                  <th className="py-3.5 px-4 text-right">24h Change</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638] text-slate-300">
                {watchlist.map((item) => (
                  <tr key={item.symbol} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {item.symbol}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">{item.name}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700">
                        {item.exchange || 'NASDAQ'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {item.currency === 'INR' ? '₹' : '$'}{item.price?.toFixed(2) || '0.00'}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono font-semibold ${
                        item.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.changePct >= 0 ? '+' : ''}{item.changePct?.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                      {item.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          to={`/predict?symbol=${item.symbol}`}
                          title="Forecast in AI Studio"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleRemove(item.symbol)}
                          title="Remove from Watchlist"
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
