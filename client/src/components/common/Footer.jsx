import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldAlert, Cpu, Database, Server } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#06080d] border-t border-[#1e2638] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Academic & Risk Alert Banner */}
        <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-amber-200 text-xs tracking-wide uppercase">
              Financial & Academic Disclaimer
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-300/90">
              Stockly is an educational and academic machine learning framework designed to evaluate time-series forecasting algorithms (Random Forest, Linear Regression, XGBoost, LSTM).
              All forecasts are non-deterministic statistical estimates derived from historical price data.
              They do <strong>not</strong> guarantee future market performance and do <strong>not</strong> constitute financial, investment, or trading advice.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#080b11]" />
              </div>
              <span className="text-white font-bold text-sm tracking-tight">Stockly</span>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              "Understand the Market. Explore the Future."
              An AI-driven MERN + Python framework for financial time-series analysis and machine learning price prediction.
            </p>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide text-xs uppercase">Platform Modules</h4>
            <ul className="space-y-2 text-[12px]">
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition">Market Dashboard</Link></li>
              <li><Link to="/stocks" className="hover:text-emerald-400 transition">Stock Explorer</Link></li>
              <li><Link to="/predict" className="hover:text-emerald-400 transition">AI Prediction Studio</Link></li>
              <li><Link to="/models" className="hover:text-emerald-400 transition">Model Benchmarking</Link></li>
              <li><Link to="/technicals" className="hover:text-emerald-400 transition">Technical Indicators</Link></li>
            </ul>
          </div>

          {/* Academic & Technology */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide text-xs uppercase">Undergraduate Major Project</h4>
            <ul className="space-y-2 text-[12px]">
              <li><Link to="/about-ai" className="hover:text-emerald-400 transition">Time-Series Methodology</Link></li>
              <li><Link to="/docs" className="hover:text-emerald-400 transition">Viva Q&A & Architecture</Link></li>
              <li className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-emerald-400" /> MongoDB Atlas ODM</li>
              <li className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-indigo-400" /> Node.js / Express REST API</li>
              <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-amber-400" /> FastAPI + Scikit-Learn Microservice</li>
            </ul>
          </div>

          {/* Coverage & Exchanges */}
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-wide text-xs uppercase">Market Coverage</h4>
            <p className="text-[11px] leading-relaxed mb-2 text-slate-400">
              Integrates real historical market feeds with support for US Blue Chips (NASDAQ, NYSE) and Indian Equities (NSE/BSE) including Reliance, TCS, Infosys, and HDFC Bank.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-[#1e2638]">NASDAQ</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-[#1e2638]">NSE India</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-[#1e2638]">BSE</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-[#1e2638]">NYSE</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1e2638] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Stockly Framework. Designed for Academic Evaluation & Research.</p>
          <div className="flex space-x-6">
            <Link to="/docs" className="hover:text-slate-300 transition">Documentation</Link>
            <Link to="/about-ai" className="hover:text-slate-300 transition">Leakage Prevention</Link>
            <Link to="/profile" className="hover:text-slate-300 transition">Preferences</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
