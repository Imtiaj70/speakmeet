import React from 'react';
import { X } from 'lucide-react';
import { CreatorCoffeeSection } from './CreatorCoffeeSection';

interface BuyCoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName?: string;
}

export const BuyCoffeeModal: React.FC<BuyCoffeeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl bg-[#0b1324] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header with Close Button */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">☕</span>
            <span className="font-extrabold text-sm text-yellow-400">Support SpeakMate Audio Lounges</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <CreatorCoffeeSection />
        </div>
      </div>
    </div>
  );
};
