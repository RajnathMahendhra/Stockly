import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

const FeatureImportanceChart = ({ featureItems = [] }) => {
  if (!featureItems || featureItems.length === 0) {
    return (
      <div className="w-full h-44 flex items-center justify-center text-slate-500 text-xs">
        No feature importances available for this model configuration.
      </div>
    );
  }

  // Format data
  const data = featureItems.slice(0, 7).map((item) => ({
    name: item.feature.replace(/_/g, ' ').toUpperCase(),
    percentage: typeof item.percentage === 'number' ? item.percentage : parseFloat(item.percentage || 0),
  }));

  const colors = ['#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#64748b'];

  return (
    <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-white tracking-tight">
          Explainable AI: Feature Importance
        </h4>
        <p className="text-[11px] text-slate-400">
          Relative contribution (%) of causal technical indicators computed via Mean Decrease in Impurity (MDI).
        </p>
      </div>

      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 'dataMax + 5']} hide />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={85}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0b0f19',
                borderColor: '#1e2638',
                borderRadius: '8px',
                fontSize: '11px',
              }}
              formatter={(val) => [`${val.toFixed(1)}%`, 'Contribution']}
            />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeatureImportanceChart;
