import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import IndicatorChart from '../components/charts/IndicatorChart';
import PriceAreaChart from '../components/charts/PriceAreaChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { stockService } from '../services/api';

const INDICATOR_EXPLANATIONS = [
  {
    name: 'Simple Moving Average (SMA 20 & SMA 50)',
    formula: 'SMA_k = (1/k) * sum(Close_{t-i})',
    description:
      'Smoothes price volatility by computing the unweighted mathematical mean over the past k trading periods. When the 20-day SMA crosses above the 50-day SMA (Golden Cross), it indicates positive medium-term momentum.',
    interpretation: 'Identifies dynamic support/resistance zones and trend orientation.',
  },
  {
    name: 'Exponential Moving Average (EMA 12 & EMA 26)',
    formula: 'EMA_t = Close_t * (2 / (k + 1)) + EMA_{t-1} * (1 - (2 / (k + 1)))',
    description:
      'Applies exponentially decreasing weights to older observations. Unlike simple moving averages, the EMA reacts much more rapidly to recent price changes.',
    interpretation: 'Reduces the lag inherent in standard simple moving averages.',
  },
  {
    name: 'Relative Strength Index (RSI 14)',
    formula: 'RSI = 100 - (100 / (1 + (Avg Gain / Avg Loss)))',
    description:
      'A bounded momentum oscillator [0, 100] developed by J. Welles Wilder. Compares the magnitude of recent gains to recent losses over a 14-period lookback window.',
    interpretation:
      'Readings above 70 suggest an asset may be overbought; readings below 30 suggest oversold conditions. Does NOT guarantee immediate reversal.',
  },
  {
    name: 'Moving Average Convergence Divergence (MACD)',
    formula: 'MACD Line = EMA_12 - EMA_26; Signal Line = EMA_9(MACD)',
    description:
      'Displays the dynamic relationship between two exponential moving averages. The histogram measures the distance between the MACD Line and the Signal Line.',
    interpretation:
      'A histogram crossing above the zero line signals accelerating upward momentum.',
  },
  {
    name: 'Bollinger Bands (20-day, 2 Std Dev)',
    formula: 'Upper/Lower = SMA_20 +/- (2 * sigma_20)',
    description:
      'Envelopes plotted two standard deviations above and below a 20-day simple moving average. Bands expand during high volatility and contract during consolidation.',
    interpretation:
      'Approximately 95% of closing prices occur within the bands under normal distribution assumptions.',
  },
  {
    name: 'Annualized Historical Volatility (20-Day)',
    formula: 'Volatility = StdDev(ln(Close_t / Close_{t-1})) * sqrt(252)',
    description:
      'Quantifies the statistical dispersion of logarithmic asset returns over a rolling 20-day window, annualized by the square root of 252 business trading days.',
    interpretation: 'Direct measure of investment risk and market uncertainty.',
  },
];

const TechnicalAnalysisPage = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [period, setPeriod] = useState('6mo');
  const [history, setHistory] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [histRes, indRes] = await Promise.all([
          stockService.getStockHistory(symbol, period),
          stockService.getStockIndicators(symbol, period),
        ]);
        if (isMounted) {
          setHistory(histRes.data?.history || []);
          setIndicators(indRes.data || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load indicators.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [symbol, period]);

  const latest = indicators[indicators.length - 1] || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1e2638]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-emerald-400" />
              Technical & Statistical Analysis
            </h1>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Econometric Indicators
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Causal indicator computations used as features for our machine learning regression models.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {['AAPL', 'NVDA', 'MSFT', 'RELIANCE.NS', 'TCS.NS'].map((s) => (
            <button
              key={s}
              onClick={() => setSymbol(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                symbol === s
                  ? 'bg-slate-700 text-emerald-400 border-slate-500'
                  : 'bg-[#111622] text-slate-400 border-[#1e2638] hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Indicator Pill Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4">
          <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">SMA 20 / 50</span>
          <div className="text-base font-bold font-mono text-white">
            ${latest.sma20?.toFixed(2) || 'N/A'} / ${latest.sma50?.toFixed(2) || 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">20 & 50-day Simple Averages</span>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4">
          <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">RSI (14-Period)</span>
          <div className="text-base font-bold font-mono text-purple-400">
            {latest.rsi14?.toFixed(1) || 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {latest.rsi14 > 70 ? 'Overbought (>70)' : latest.rsi14 < 30 ? 'Oversold (<30)' : 'Neutral Zone'}
          </span>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4">
          <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">MACD Histogram</span>
          <div className="text-base font-bold font-mono text-indigo-400">
            {latest.macdHist !== undefined ? latest.macdHist?.toFixed(3) : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Convergence Momentum</span>
        </div>

        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4">
          <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">Bollinger Band %B</span>
          <div className="text-base font-bold font-mono text-emerald-400">
            {latest.bbUpper && latest.bbLower
              ? `${latest.bbLower?.toFixed(1)} - ${latest.bbUpper?.toFixed(1)}`
              : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Lower - Upper Band</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label={`Calculating indicators for ${symbol}...`} />
      ) : (
        <>
          {/* Charts */}
          <PriceAreaChart
            data={history}
            symbol={symbol}
            currentPeriod={period}
            onPeriodChange={(p) => setPeriod(p)}
          />
          <IndicatorChart data={indicators} activeIndicator="rsi" />

          {/* Academic Indicator Reference Cards */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              Indicator Reference & Feature Math Guide (Viva Cheat Sheet)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INDICATOR_EXPLANATIONS.map((ind, i) => (
                <div key={i} className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 space-y-2">
                  <h4 className="text-xs font-bold text-white">{ind.name}</h4>
                  <div className="bg-[#0b0f19] px-2.5 py-1.5 rounded-lg border border-[#1e2638] font-mono text-[11px] text-indigo-300">
                    {ind.formula}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{ind.description}</p>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-[#1e2638]">
                    <strong>Interpretation:</strong> {ind.interpretation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TechnicalAnalysisPage;
