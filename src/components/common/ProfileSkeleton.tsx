import React from 'react';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-8 animate-pulse">
      {/* Profile Header Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-28" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-64" />
            </div>
          </div>
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-full" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-3/4" />
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2"
          >
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-8 bg-slate-100 dark:bg-slate-800/60 rounded w-3/4" />
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800/40 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
};
