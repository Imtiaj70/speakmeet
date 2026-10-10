import React from 'react';

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
};
