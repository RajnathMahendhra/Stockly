import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Loading market intelligence...', size = 'default' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <Loader2 className={`animate-spin text-emerald-400 ${size === 'small' ? 'w-5 h-5' : 'w-8 h-8'}`} />
      <p className="text-xs text-slate-400 font-medium tracking-wide">{label}</p>
    </div>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="w-full h-[360px] bg-[#111622] border border-[#1e2638] rounded-2xl p-6 flex flex-col justify-between animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-6 w-48 bg-slate-800 rounded-lg"></div>
        <div className="h-6 w-32 bg-slate-800 rounded-lg"></div>
      </div>
      <div className="space-y-4">
        <div className="h-32 bg-slate-800/40 rounded-xl"></div>
        <div className="h-16 bg-slate-800/20 rounded-xl"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-16 bg-slate-800 rounded"></div>
        <div className="h-4 w-16 bg-slate-800 rounded"></div>
        <div className="h-4 w-16 bg-slate-800 rounded"></div>
        <div className="h-4 w-16 bg-slate-800 rounded"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
