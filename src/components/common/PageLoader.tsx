import React from 'react';
import { Mic } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Connecting to SpeakMate session...',
}) => {
  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Mic className="w-7 h-7 animate-pulse" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-indigo-600/30 dark:border-indigo-400/30 animate-ping opacity-60" />
      </div>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 animate-pulse">
        {message}
      </p>
    </div>
  );
};
