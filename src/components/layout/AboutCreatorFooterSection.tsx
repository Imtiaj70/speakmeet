import React from 'react';
import { CreatorCoffeeSection } from '../common/CreatorCoffeeSection';
import { Sparkles, UserCheck } from 'lucide-react';

export const AboutCreatorFooterSection: React.FC = () => {
  return (
    <section aria-label="About Creator and Support" className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/40 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Independent Project & Community Support</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              About the Creator & Support SpeakMate
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              SpeakMate is an open educational initiative providing free, real-time WebRTC audio practice for learners worldwide. Your coffee support keeps the servers fast and completely free for everyone.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Direct Developer Backed
            </span>
          </div>
        </div>

        {/* Creator & Coffee Dual Cards */}
        <CreatorCoffeeSection className="!my-0" />
      </div>
    </section>
  );
};
