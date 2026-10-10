import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../../data/mockStats';
import { Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Four Simple Steps to Fluency
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How SpeakMate Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            No scheduling friction, no expensive tutor rates. Hop into a real conversation whenever you have 15 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div
              key={step.step}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/80 dark:border-slate-800 relative flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                <span className="text-3xl font-black text-slate-200 dark:text-slate-800 tracking-tighter block mb-4">
                  {step.step}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <span>Phase {idx + 1}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <span>See live rooms currently open</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
