import React from 'react';
import { motion } from 'motion/react';
import { Mic, Plus, Users, Sparkles } from 'lucide-react';

interface OpenStageSeatProps {
  seatIndex: number;
  isParticipant: boolean;
  isClosed: boolean;
  onJoin: () => void;
  canTakeMic?: boolean;
}

export const OpenStageSeat: React.FC<OpenStageSeatProps> = ({
  seatIndex,
  isParticipant,
  isClosed,
  onJoin,
  canTakeMic = false,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={() => {
        if (!isClosed && !isParticipant) {
          onJoin();
        }
      }}
      className={`group relative rounded-2xl border-2 border-dashed p-4 sm:p-5 flex flex-col items-center justify-between min-h-[220px] text-center transition-all duration-300 animate-seat-glow cursor-pointer ${
        !isClosed && !isParticipant
          ? 'border-indigo-300/80 dark:border-indigo-800/80 bg-gradient-to-b from-indigo-50/40 via-white to-indigo-50/20 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-indigo-950/10 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10'
          : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30'
      }`}
    >
      {/* Top stage slot label */}
      <div className="w-full flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
          Seat #{seatIndex + 1}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Available
        </span>
      </div>

      {/* Center animated seat pedestal with pulsing radar ring */}
      <div className="relative my-3 flex items-center justify-center">
        {/* Animated beacon ripple rings */}
        <span className="absolute w-20 h-20 rounded-full border border-indigo-400/20 dark:border-indigo-500/20 animate-ping opacity-30 pointer-events-none" />
        <span className="absolute w-16 h-16 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 animate-pulse pointer-events-none" />

        {/* Circular mic icon base */}
        <div className="relative w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-500 transition-all duration-300 shadow-xs group-hover:scale-105">
          <Mic className="w-6 h-6 transition-transform group-hover:scale-110" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Plus className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Description & Interactive CTA */}
      <div className="w-full space-y-1">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-center gap-1">
          <span>Open Stage Seat</span>
          <Sparkles className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {!isClosed && !isParticipant ? (
          <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
            Click to take this seat & speak
          </p>
        ) : (
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Open mic for learner
          </p>
        )}
      </div>
    </motion.div>
  );
};
