import React from 'react';
import { WHY_SPEAKMATE_POINTS } from '../../data/mockStats';
import { Mic, Globe2, ShieldCheck, Sparkles, Zap, BarChart3, LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Mic,
  Globe2,
  ShieldCheck,
  Sparkles,
  Zap,
  BarChart3,
};

export const WhySection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Engineered For Spoken Confidence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why SpeakMate Works When Textbooks Fail
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Most language apps train passive recognition. Fluency only happens when neural pathways practice real speech retrieval under conversational pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {WHY_SPEAKMATE_POINTS.map((item) => {
            const Icon = ICON_MAP[item.icon] || Mic;
            return (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
