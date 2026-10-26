import React, { useState } from 'react';
import { User, Settings, Save, Check, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileSettingsPage = () => {
  const { user, updatePreferences, logout } = useAuth();

  const [theme, setTheme] = useState(user?.preferences?.theme || 'dark');
  const [defaultStock, setDefaultStock] = useState(user?.preferences?.defaultStock || 'AAPL');
  const [defaultHorizon, setDefaultHorizon] = useState(user?.preferences?.defaultHorizon || 5);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePreferences({
        theme,
        defaultStock,
        defaultHorizon: parseInt(defaultHorizon, 10),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(`Preferences update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#1e2638]">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          Account & Terminal Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your Stockly profile and customize default financial parameters.
        </p>
      </div>

      {/* User Information Card */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/10">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{user?.name || 'Guest User'}</h3>
            <p className="text-xs text-slate-400">{user?.email || 'guest@stockly.edu'}</p>
            <span className="inline-block mt-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
              Role: {user?.role || 'Undergraduate Researcher'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* Preferences Form */}
      <form onSubmit={handleSave} className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
          Terminal Customization
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Default Asset Symbol
            </label>
            <input
              type="text"
              value={defaultStock}
              onChange={(e) => setDefaultStock(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL, RELIANCE.NS"
              className="w-full px-3.5 py-2.5 bg-[#0b0f19] text-white font-mono rounded-xl border border-[#1e2638] focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500 block mt-1">
              Symbol automatically loaded when opening Dashboard or Studio.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Default Forecast Horizon
            </label>
            <select
              value={defaultHorizon}
              onChange={(e) => setDefaultHorizon(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0b0f19] text-white rounded-xl border border-[#1e2638] focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value={1}>1 Trading Day (Next-day)</option>
              <option value={5}>5 Trading Days (1-week)</option>
              <option value={20}>20 Trading Days (1-month)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Visual Theme Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl border text-center transition ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-emerald-400 border-emerald-500/50 font-bold'
                    : 'bg-[#0b0f19] text-slate-400 border-[#1e2638]'
                }`}
              >
                Dark Fintech (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl border text-center transition ${
                  theme === 'light'
                    ? 'bg-slate-800 text-emerald-400 border-emerald-500/50 font-bold'
                    : 'bg-[#0b0f19] text-slate-400 border-[#1e2638]'
                }`}
              >
                Clean Slate Mode
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#1e2638] flex items-center justify-between">
          {saved ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Preferences saved successfully to MongoDB!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              Preferences persist across devices via MongoDB Atlas.
            </span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettingsPage;
