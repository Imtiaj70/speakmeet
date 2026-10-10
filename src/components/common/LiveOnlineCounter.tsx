import React, { useState, useEffect } from 'react';
import { Users, Globe2, Radio, Sparkles } from 'lucide-react';

interface StatsResponse {
  onlineLearners: number;
  activeRooms: number;
  activeCountries: number;
}

export const LiveOnlineCounter: React.FC<{ variant?: 'badge' | 'hero' | 'compact'; className?: string }> = ({
  variant = 'badge',
  className = '',
}) => {
  const [stats, setStats] = useState<StatsResponse>({
    onlineLearners: 164,
    activeRooms: 12,
    activeCountries: 48,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats/online');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.onlineLearners) {
            setStats({
              onlineLearners: data.onlineLearners,
              activeRooms: data.activeRooms || 12,
              activeCountries: data.activeCountries || 48,
            });
          }
        }
      } catch {}
    };

    fetchStats();
    const interval = setInterval(fetchStats, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>{stats.onlineLearners} Online</span>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div
        className={`inline-flex flex-wrap items-center gap-3 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold mr-1">
              {stats.onlineLearners}
            </span>
            Learners Speaking Live
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <span>·</span>
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
            <Radio className="w-3.5 h-3.5 text-indigo-500" />
            {stats.activeRooms} Live Lounges
          </span>
          <span>·</span>
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
            <Globe2 className="w-3.5 h-3.5 text-sky-500" />
            {stats.activeCountries} Countries
          </span>
        </div>
      </div>
    );
  }

  // Default badge variant
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs ${className}`}
      title={`${stats.onlineLearners} language learners currently practicing across ${stats.activeCountries} countries`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
        <span>{stats.onlineLearners}</span>
        <span className="font-normal text-emerald-700/80 dark:text-emerald-400">Online Now</span>
      </span>
      <span className="text-[10px] text-slate-300 dark:text-slate-700">|</span>
      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hidden sm:inline">
        {stats.activeRooms} Lounges
      </span>
    </div>
  );
};
