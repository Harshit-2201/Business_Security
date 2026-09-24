import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="p-4 border border-slate-200 bg-white animate-pulse shadow-2xs">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 bg-slate-200 shrink-0 border border-slate-300" />
        <div className="flex-1 space-y-2">
          <div className="w-2/3 h-4 bg-slate-200" />
          <div className="w-1/3 h-3 bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="w-32 h-6 bg-slate-100 border border-slate-200" />
        <div className="flex gap-2">
          <div className="w-7 h-7 bg-slate-200" />
          <div className="w-7 h-7 bg-slate-200" />
        </div>
      </div>
    </div>
  );
};
