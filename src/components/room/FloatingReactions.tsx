import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface FloatingEmoji {
  id: number;
  emoji: string;
  left: number; // percentage across stage (10% to 90%)
  size: number;
}

interface FloatingReactionsProps {
  isAnyoneSpeaking?: boolean;
}

const REACTION_OPTIONS = [
  { emoji: '👏', label: 'Clap' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💡', label: 'Insight' },
  { emoji: '🎯', label: 'Spot on' },
  { emoji: '☕', label: 'Cheers' },
  { emoji: '😂', label: 'Haha' },
];

export const FloatingReactions: React.FC<FloatingReactionsProps> = ({
  isAnyoneSpeaking = false,
}) => {
  const [activeReactions, setActiveReactions] = useState<FloatingEmoji[]>([]);

  const spawnReaction = useCallback((emoji: string) => {
    const id = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 75) + 12; // 12% to 87%
    const size = Math.floor(Math.random() * 10) + 24; // 24px to 34px

    setActiveReactions((prev) => [...prev.slice(-15), { id, emoji, left, size }]);

    // Auto cleanup after animation finishes (2.2s)
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2200);
  }, []);

  // Ambient audience reactions when someone speaks to make room feel alive
  useEffect(() => {
    if (!isAnyoneSpeaking) return;

    const timer = setInterval(() => {
      if (Math.random() > 0.4) {
        const randomEmoji = REACTION_OPTIONS[Math.floor(Math.random() * REACTION_OPTIONS.length)].emoji;
        spawnReaction(randomEmoji);
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [isAnyoneSpeaking, spawnReaction]);

  return (
    <>
      {/* Container for floating upward emojis across the stage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden z-20"
      >
        {activeReactions.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-4 select-none drop-shadow-md animate-[float-reaction-up_2.2s_cubic-bezier(0.2,0.8,0.2,1)_forwards]"
            style={{
              left: `${item.left}%`,
              fontSize: `${item.size}px`,
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Floating Reaction Bar below the stage */}
      <div className="flex items-center justify-between gap-2 p-2 px-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px]">Send Live Reaction:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {REACTION_OPTIONS.map((item) => (
            <button
              key={item.emoji}
              type="button"
              onClick={() => spawnReaction(item.emoji)}
              aria-label={`Send ${item.label} reaction`}
              title={`React with ${item.label}`}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 hover:scale-125 active:scale-95 transition-all text-base flex items-center justify-center cursor-pointer shadow-2xs hover:shadow-md"
            >
              {item.emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
