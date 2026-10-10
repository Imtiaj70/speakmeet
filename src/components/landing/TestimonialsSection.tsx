import React from 'react';
import { TESTIMONIALS } from '../../data/mockStats';
import { Quote, Star } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Real Transformations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hear From Our Global Community
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            From overcoming stuttering hesitation to passing academic exams and acing remote job interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/60 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* 5 stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.country}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block">
                    {item.levelProgress}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.minutesPracticed} mins spoke
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
