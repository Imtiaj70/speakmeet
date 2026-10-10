import React, { useState } from 'react';
import { BuyCoffeeModal } from './BuyCoffeeModal';

interface BuyCoffeeButtonProps {
  className?: string;
  variant?: 'nav' | 'banner' | 'pill' | 'compact';
}

export const BuyCoffeeButton: React.FC<BuyCoffeeButtonProps> = ({
  className = '',
  variant = 'nav',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'pill') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 dark:bg-amber-500 dark:hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs hover:shadow transition-all hover:scale-105 active:scale-95 cursor-pointer ${className}`}
          title="Support our servers & keep speaking free"
        >
          <span className="text-sm">☕</span>
          <span>Buy me a coffee</span>
        </button>
        <BuyCoffeeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold text-xs transition-colors cursor-pointer ${className}`}
          title="Buy me a coffee"
        >
          <span className="text-sm">☕</span>
          <span className="hidden sm:inline">Coffee</span>
        </button>
        <BuyCoffeeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  // Default nav button
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 dark:bg-amber-400 dark:hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm hover:shadow transition-all hover:scale-105 active:scale-95 cursor-pointer ${className}`}
        title="Support SpeakMate"
      >
        <span className="text-sm animate-bounce" style={{ animationDuration: '2s' }}>☕</span>
        <span className="hidden sm:inline">Buy me a coffee</span>
      </button>
      <BuyCoffeeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
