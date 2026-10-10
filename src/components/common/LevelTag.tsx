import React from 'react';
import { EnglishLevel } from '../../types';

interface LevelTagProps {
  level: EnglishLevel | 'All Levels';
  className?: string;
  showDot?: boolean;
}

const LEVEL_COLORS: Record<string, { dot: string; text: string }> = {
  Beginner: { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  Elementary: { dot: 'bg-teal-500', text: 'text-teal-700 dark:text-teal-400' },
  Intermediate: { dot: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-400' },
  'Upper Intermediate': { dot: 'bg-blue-600', text: 'text-blue-700 dark:text-blue-400' },
  Advanced: { dot: 'bg-purple-600', text: 'text-purple-700 dark:text-purple-400' },
  'All Levels': { dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
};

export const LevelTag: React.FC<LevelTagProps> = ({ level, className = '', showDot = true }) => {
  const config = LEVEL_COLORS[level] || { dot: 'bg-slate-400', text: 'text-slate-600 dark:text-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.text} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />}
      <span>{level}</span>
    </span>
  );
};
