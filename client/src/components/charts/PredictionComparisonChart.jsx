import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

const CustomPredictionTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#0b0f19]/95 border border-[#1e2638] p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1 min-w-[190px]">
        <div className="font-semibold text-slate-300 border-b border-[#1e2638] pb-1">
          {item.date} {item.isForecast ? '(Forecast Horizon)' : '(Historical)'}
        </div>
        {item.historicalClose !== null && item.historicalClose !== undefined && (
          <div className="flex justify-between items-center text-slate-300">
            <span>Observed Price:</span>
            <span className="font-bold text-white">${item.historicalClose.toFixed(2)}</span>
          </div>
        )}
        {item.predictedClose !== null && item.predictedClose !== undefined && (
          <div className="flex justify-between items-center text-emerald-400">
            <span>Model Prediction:</span>
            <span className="font-bold text-emerald-400">${item.predictedClose.toFixed(2)}</span>
          </div>
        )}
        {item.upperBound && item.lowerBound && (
          <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1e2638] flex justify-between">
            <span>Confidence Range:</span>
            <span>
              ${item.lowerBound.toFixed(2)} - ${item.upperBound.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const PredictionComparisonChart = ({
  historicalBars = [],
  forecasts = [],
  originDate = '',
  originPrice = 0,
  modelName = 'Random Forest',
}) => {
  // Combine the last 20 historical bars with the future forecast points
  const recentHistory = historicalBars.slice(-25).map((bar) => ({
    date: bar.date,
    historicalClose: bar.close,
    predictedClose: null,
    lowerBound: null,
    upperBound: null,
    isForecast: false,
  }));

  // Bridge point at forecast origin date
  const bridgePoint = {
    date: originDate || (recentHistory[recentHistory.length - 1]?.date || 'Origin'),
    historicalClose: originPrice || recentHistory[recentHistory.length - 1]?.historicalClose,
    predictedClose: originPrice || recentHistory[recentHistory.length - 1]?.historicalClose,
    lowerBound: originPrice,
    upperBound: originPrice,
    isForecast: false,
  };

  const futurePoints = (forecasts || []).map((f) => ({
    date: f.date,
    historicalClose: null,
    predictedClose: f.predicted_close || f.predictedClose,
    lowerBound: f.lower_bound || f.lowerBound,
    upperBound: f.upper_bound || f.upperBound,
    isForecast: true,
  }));

  const chartData = [...recentHistory, bridgePoint, ...futurePoints];

  // Calculate price domain
  const allPrices = [
    ...recentHistory.map((d) => d.historicalClose),
    ...futurePoints.map((d) => d.predictedClose),
    ...futurePoints.map((d) => d.upperBound),
    ...futurePoints.map((d) => d.lowerBound),
  ].filter((p) => typeof p === 'number' && !isNaN(p));

  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const pad = (maxP - minP) * 0.1 || 5;

  return (
    <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">
            Multi-Step Forecast Trajectory & Confidence Envelope
          </h4>
          <p className="text-[11px] text-slate-400">
            Historical observations connected to {modelName} forecasts with statistical standard error envelope.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-300 rounded"></span>
            <span className="text-slate-300">Observed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 border-dashed rounded"></span>
            <span className="text-emerald-400 font-medium">Forecast Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-sm"></span>
            <span className="text-slate-400">95% Envelope</span>
          </div>
        </div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="envelopeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2233" vertical={false} />
            <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} minTickGap={35} />
            <YAxis
              domain={[Math.floor(minP - pad), Math.ceil(maxP + pad)]}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomPredictionTooltip />} />

            {/* Origin line marker */}
            {originDate && (
              <ReferenceLine
                x={originDate}
                stroke="#6366f1"
                strokeDasharray="4 4"
                label={{
                  value: 'Forecast Origin',
                  fill: '#818cf8',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />
            )}

            {/* Confidence Envelope (upper & lower) */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="transparent"
              fill="url(#envelopeGradient)"
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="transparent"
              fill="#111622"
            />

            {/* Historical Observed Line */}
            <Line
              type="monotone"
              dataKey="historicalClose"
              stroke="#94a3b8"
              strokeWidth={2}
              dot={false}
            />

            {/* Forecast Trajectory Line */}
            <Line
              type="monotone"
              dataKey="predictedClose"
              stroke="#10b981"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ fill: '#10b981', r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PredictionComparisonChart;
