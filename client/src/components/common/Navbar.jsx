import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  Search,
  Activity,
  Layers,
  BarChart2,
  Bookmark,
  BookOpen,
  Info,
  User,
  LogOut,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { stockService } from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (val.trim().length > 0) {
      try {
        const res = await stockService.searchStocks(val);
        setSearchResults(res.data || []);
        setIsSearching(true);
      } catch (e) {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleSelectStock = (sym) => {
    setIsSearching(false);
    setSearchQuery('');
    navigate(`/stocks/${sym}`);
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: Activity },
    { label: 'Explorer', path: '/stocks', icon: Compass },
    { label: 'AI Studio', path: '/predict', icon: TrendingUp },
    { label: 'Model Benchmark', path: '/models', icon: Layers },
    { label: 'Technicals', path: '/technicals', icon: BarChart2 },
    { label: 'Watchlist', path: '/watchlist', icon: Bookmark },
    { label: 'About AI', path: '/about-ai', icon: Info },
    { label: 'Docs', path: '/docs', icon: BookOpen },
  ];

  const isActive = (p) => location.pathname === p || (p !== '/' && location.pathname.startsWith(p));

  return (
    <header className="sticky top-0 z-50 bg-[#080b11]/90 backdrop-blur-md border-b border-[#1e2638]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-indigo-600 to-emerald-400 p-[1.5px] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Stockly
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  AI
                </span>
              </span>
            </div>
          </Link>

          {/* Search bar with autocomplete */}
          <div className="hidden md:flex flex-1 max-w-xs mx-8 relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search stocks (e.g. AAPL, RELIANCE.NS)..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setIsSearching(true)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#111622] text-slate-200 placeholder-slate-500 border border-[#1e2638] rounded-lg focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {isSearching && searchResults.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-[#111622] border border-[#1e2638] rounded-xl shadow-2xl overflow-hidden z-50"
                onMouseLeave={() => setIsSearching(false)}
              >
                <div className="p-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-3 border-b border-[#1e2638]">
                  Matching Securities
                </div>
                {searchResults.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => handleSelectStock(item.symbol)}
                    className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/60 transition-colors"
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-[#1e2638] text-xs transition"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium max-w-[100px] truncate">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 rounded-lg shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d121f] border-b border-[#1e2638] px-4 pt-2 pb-4 space-y-1">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search ticker..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#111622] text-white rounded-lg border border-[#1e2638]"
            />
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800"
            >
              <link.icon className="w-4 h-4 text-slate-400" />
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#1e2638] flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-slate-200 py-1"
                >
                  Account ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left text-sm text-rose-400 py-1"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-slate-200 py-1"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-emerald-400 font-semibold py-1"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
