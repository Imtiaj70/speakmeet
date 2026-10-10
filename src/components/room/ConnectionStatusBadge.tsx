import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusBadgeProps {
  isConnected: boolean;
  isReconnecting: boolean;
  className?: string;
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({
  isConnected,
  isReconnecting,
  className = '',
}) => {
  if (isReconnecting) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 ${className}`}
        title="Reconnecting to real-time server..."
      >
        <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
        <span>Reconnecting...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 ${className}`}
        title="Live real-time room connection active"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span>Live Connected</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 ${className}`}
      title="Connecting to real-time server"
    >
      <WifiOff className="w-3 h-3 text-slate-400" />
      <span>Connecting</span>
    </div>
  );
};
