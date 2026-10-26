import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const StatCard = ({
  title,
  value,
  change,
  changePct,
  prefix = '',
  suffix = '',
  subtitle,
  icon: Icon,
  variant = 'default',
}) => {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 hover:border-slate-700/60 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/50">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold tracking-tight text-white">
          {prefix}{typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}{suffix}
        </span>
      </div>

      {(change !== undefined || changePct !== undefined || subtitle) && (
        <div className="mt-3 flex items-center justify-between text-xs">
          {changePct !== undefined ? (
            <div
              className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : isNegative
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : isNegative ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>
                {isPositive ? '+' : ''}
                {typeof changePct === 'number' ? changePct.toFixed(2) : changePct}%
              </span>
            </div>
          ) : (
            <span />
          )}

          {subtitle && (
            <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
