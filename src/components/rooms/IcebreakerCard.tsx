import React, { useState } from 'react';
import {
  Sparkles,
  Dices,
  Copy,
  Check,
  Flame,
  Globe2,
  Brain,
  Coffee,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface Icebreaker {
  id: number;
  category: 'IELTS Cue Card' | 'Travel & Culture' | 'Deep Thoughts' | 'Fun & Casual' | 'Tech & Future';
  question: string;
  starterHint: string;
}

const ICEBREAKERS: Icebreaker[] = [
  {
    id: 1,
    category: 'Travel & Culture',
    question: 'If you had a free plane ticket right now to anywhere in the world, where would you fly and why?',
    starterHint: 'Start with: "I would definitely fly to... because I have always wanted to experience..."',
  },
  {
    id: 2,
    category: 'Fun & Casual',
    question: 'What is one unusual habit or daily routine that you do every single day?',
    starterHint: 'Start with: "One thing I do every day without fail is..."',
  },
  {
    id: 3,
    category: 'IELTS Cue Card',
    question: 'Describe an unforgettable journey or trip you took. Who were you with and what made it memorable?',
    starterHint: 'Start with: "An unforgettable trip that comes to mind is when I traveled to..."',
  },
  {
    id: 4,
    category: 'Tech & Future',
    question: 'Do you think AI and smartphones are making people more connected or more lonely?',
    starterHint: 'Start with: "In my opinion, technology is a double-edged sword because..."',
  },
  {
    id: 5,
    category: 'Deep Thoughts',
    question: 'If you could give one piece of advice to your 16-year-old self, what would it be?',
    starterHint: 'Start with: "If I could turn back the clock, I would advise myself to..."',
  },
  {
    id: 6,
    category: 'Fun & Casual',
    question: 'What is your absolute favorite comfort food or dish from your home country that everyone must try?',
    starterHint: 'Start with: "If you ever visit my country, the first food you have to taste is..."',
  },
  {
    id: 7,
    category: 'IELTS Cue Card',
    question: 'Talk about a skill you would like to master in the next 12 months. Why is it important to you?',
    starterHint: 'Start with: "A valuable skill I really want to develop this year is..."',
  },
  {
    id: 8,
    category: 'Travel & Culture',
    question: 'What is the biggest cultural difference or culture shock you have ever experienced or heard of?',
    starterHint: 'Start with: "One cultural difference that surprised me was how people in..."',
  },
  {
    id: 9,
    category: 'Deep Thoughts',
    question: 'What does a truly successful and happy life look like to you?',
    starterHint: 'Start with: "To me, success isn’t just about money, it’s mostly about..."',
  },
  {
    id: 10,
    category: 'Tech & Future',
    question: 'Would you prefer to work remotely from home forever or go to a lively office with colleagues?',
    starterHint: 'Start with: "Personally, I thrive much better when I work..."',
  },
  {
    id: 11,
    category: 'Fun & Casual',
    question: 'What is a movie, book, or series that completely blew your mind recently?',
    starterHint: 'Start with: "I recently watched / read... and the plot twist was incredible because..."',
  },
  {
    id: 12,
    category: 'IELTS Cue Card',
    question: 'Describe a person who inspired you or taught you an important life lesson.',
    starterHint: 'Start with: "The person who has had the greatest influence on my mindset is..."',
  },
];

export const IcebreakerCard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = ICEBREAKERS[currentIndex];

  const handleNext = () => {
    let next = Math.floor(Math.random() * ICEBREAKERS.length);
    if (next === currentIndex) {
      next = (currentIndex + 1) % ICEBREAKERS.length;
    }
    setCurrentIndex(next);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${current.question}"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 border border-indigo-500/30 p-4 sm:p-5 text-white shadow-xl">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Conversation Spark</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            {current.category}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Copy question text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Get another random icebreaker topic"
          >
            <Dices className="w-4 h-4" />
            <span>Next Topic (পরের প্রশ্ন)</span>
          </button>
        </div>
      </div>

      {/* Main Question Display */}
      <div className="py-2 space-y-2">
        <p className="text-base sm:text-lg font-extrabold text-white leading-snug tracking-tight">
          "{current.question}"
        </p>

        {/* Helpful Fluency Starter Hint */}
        <div className="flex items-start gap-2 pt-1 text-xs text-indigo-200/90 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-800/40">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Speaking Starter: </span>
            <span className="italic">{current.starterHint}</span>
          </div>
        </div>
      </div>

      {/* Footer Encouragement */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
        <span className="flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-500" />
          <span>Challenge: Speak for 45-60 seconds without hesitating!</span>
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          #{current.id} of {ICEBREAKERS.length} prompts
        </span>
      </div>
    </div>
  );
};
