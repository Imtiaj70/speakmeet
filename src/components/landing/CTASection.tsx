import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const CTASection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow behind container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-500/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-xs font-medium text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Zero fee to begin · Works on any device</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Ready to Stop Translating in Your Head?
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The fastest way to speak fluently is simply to start talking. Jump into a friendly room today and meet conversation partners who want you to succeed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 font-semibold px-8 shadow-lg shadow-white/10"
              leftIcon={<Mic className="w-5 h-5 text-indigo-600" />}
            >
              Start Speaking for Free
            </Button>
          </Link>
          <Link to="/rooms" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-slate-700 text-white hover:bg-slate-800"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Browse Open Rooms
            </Button>
          </Link>
        </div>

        <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> No credit card required
          </span>
          <span>·</span>
          <span>Open 24/7 globally</span>
        </div>
      </div>
    </section>
  );
};
