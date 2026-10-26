import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const CustomTooltip = ({ active, payload, label, currency = 'USD' }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isGain = data.close >= data.open;
    return (
      <div className="bg-[#0b0f19]/95 border border-[#1e2638] p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[170px]">
        <div className="font-semibold text-slate-300 border-b border-[#1e2638] pb-1">
          {data.date}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Close:</span>
          <span className={`font-bold ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
            {currency === 'INR' ? '₹' : '$'}{data.close?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Open:</span>
          <span className="text-slate-200">{data.open?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>High / Low:</span>
          <span className="text-slate-200">
            {data.high?.toFixed(2)} / {data.low?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1e2638]">
          <span>Volume:</span>
          <span className="text-slate-300 font-mono">
            {data.volume ? (data.volume / 1000000).toFixed(2) + 'M' : 'N/A'}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const PriceAreaChart = ({
  data = [],
  symbol = '',
  currency = 'USD',
  onPeriodChange,
  currentPeriod = '1y',
}) => {
  const [showVolume, setShowVolume] = useState(true);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-slate-500 text-xs">
        No historical chart data available.
      </div>
    );
  }

  const firstPrice = data[0]?.close || 0;
  const lastPrice = data[data.length - 1]?.close || 0;
  const isUp = lastPrice >= firstPrice;
  const color = isUp ? '#10b981' : '#f43f5e';

  // Calculate dynamic Y-axis domain with padding
  const closes = data.map((d) => d.close).filter((c) => typeof c === 'number');
  const minPrice = Math.min(...closes);
  const maxPrice = Math.max(...closes);
  const padding = (maxPrice - minPrice) * 0.08;
  const yDomain = [Math.max(0, Math.floor(minPrice - padding)), Math.ceil(maxPrice + padding)];

  const periods = ['1mo', '3mo', '6mo', '1y'];

  return (
    <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5">
      {/* Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white tracking-tight">Price Movement</h3>
            <span className="text-[11px] font-mono text-slate-400">({symbol})</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {currency === 'INR' ? 'INR (₹)' : 'USD ($)'} • End-of-Day Adjusted OHLCV
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#0b0f19] p-1 rounded-xl border border-[#1e2638]">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange && onPeriodChange(p)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg uppercase transition-all ${
                currentPeriod === p
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Price Area Chart */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2233" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1e2638' }}
              minTickGap={40}
            />
            <YAxis
              domain={yDomain}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (currency === 'INR' ? `₹${v}` : `$${v}`)}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Bar Sub-Chart */}
      {showVolume && (
        <div className="mt-3 pt-3 border-t border-[#1e2638]/70">
          <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>Trading Volume</span>
            <span className="font-mono text-slate-500">Bars</span>
          </div>
          <div className="w-full h-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  formatter={(val) => [(val / 1000000).toFixed(2) + 'M', 'Volume']}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                  contentStyle={{
                    backgroundColor: '#0b0f19',
                    borderColor: '#1e2638',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar
                  dataKey="volume"
                  fill="#3b82f6"
                  opacity={0.65}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAreaChart;
