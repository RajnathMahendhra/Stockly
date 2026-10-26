import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

const IndicatorChart = ({ data = [], activeIndicator = 'rsi' }) => {
  const [indicator, setIndicator] = useState(activeIndicator);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-slate-500 text-xs">
        No indicator metrics calculated.
      </div>
    );
  }

  return (
    <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">
            {indicator === 'rsi' ? 'Relative Strength Index (RSI 14)' : 'MACD (12, 26, 9)'}
          </h4>
          <p className="text-[11px] text-slate-400">
            {indicator === 'rsi'
              ? 'Momentum oscillator bounded [0, 100]. Overbought > 70, Oversold < 30.'
              : 'Trend-following momentum indicator displaying relationship between two EMAs.'}
          </p>
        </div>

        <div className="flex space-x-1.5 bg-[#0b0f19] p-1 rounded-xl border border-[#1e2638]">
          <button
            onClick={() => setIndicator('rsi')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              indicator === 'rsi'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            RSI
          </button>
          <button
            onClick={() => setIndicator('macd')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              indicator === 'macd'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MACD
          </button>
        </div>
      </div>

      {indicator === 'rsi' ? (
        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2233" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} minTickGap={40} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} ticks={[30, 50, 70]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1e2638', borderRadius: '8px', fontSize: '11px' }}
                formatter={(val) => [Number(val).toFixed(2), 'RSI']}
              />
              <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Overbought (70)', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Oversold (30)', fill: '#10b981', fontSize: 10, position: 'insideBottomRight' }} />
              <Line type="monotone" dataKey="rsi14" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2233" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} minTickGap={40} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1e2638', borderRadius: '8px', fontSize: '11px' }}
                formatter={(val, name) => [Number(val).toFixed(3), name]}
              />
              <ReferenceLine y={0} stroke="#475569" />
              <Bar dataKey="macdHist" fill="#3b82f6" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default IndicatorChart;
