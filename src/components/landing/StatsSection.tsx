import React from 'react';
import { PLATFORM_STATS } from '../../data/mockStats';
import { Users, Clock, Globe, TrendingUp, LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Clock,
  Globe,
  TrendingUp,
};

export const StatsSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 border-y border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {PLATFORM_STATS.map((stat) => {
            const Icon = ICON_MAP[stat.icon] || Globe;
            return (
              <div key={stat.label} className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {stat.subtext}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
