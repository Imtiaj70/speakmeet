import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Radio,
  BookOpen,
  Zap,
  Globe,
  User,
  LogIn,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuickMatch } from '../../hooks/useQuickMatch';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { isMatching, triggerQuickMatch } = useQuickMatch();

  const isActive = (path: string) => {
    if (path === '/rooms') {
      return location.pathname === '/' || location.pathname.startsWith('/rooms');
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 shadow-2xl">
      <div className="grid grid-cols-5 items-center justify-items-center px-2">
        {/* Tab 1: Live Lounges */}
        <Link
          to="/rooms"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer w-full ${
            isActive('/rooms')
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <Radio className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-[10px] mt-1 leading-tight tracking-tight">Lounges</span>
        </Link>

        {/* Tab 2: Topics */}
        <Link
          to="/topics"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer w-full ${
            isActive('/topics')
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-1 leading-tight tracking-tight">Topics</span>
        </Link>

        {/* Center Tab: Floating Quick Match Action */}
        <div className="flex flex-col items-center justify-center -mt-5">
          <button
            type="button"
            disabled={isMatching}
            onClick={triggerQuickMatch}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 active:scale-90 hover:scale-105 transition-all cursor-pointer border-2 border-white dark:border-slate-900"
            title="Instant Quick Match: Join speaking room"
            aria-label="Quick Match"
          >
            {isMatching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Zap className="w-6 h-6 fill-white" />
            )}
          </button>
          <span className="text-[9.5px] font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 tracking-tight uppercase">
            {isMatching ? 'Matching...' : 'Quick Match'}
          </span>
        </div>

        {/* Tab 4: Partners */}
        <Link
          to="/partner"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer w-full ${
            isActive('/partner')
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-5 h-5" />
          <span className="text-[10px] mt-1 leading-tight tracking-tight">Partners</span>
        </Link>

        {/* Tab 5: Profile or Login */}
        <Link
          to={isAuthenticated ? '/profile' : '/login'}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer w-full ${
            isActive('/profile') || isActive('/login')
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {isAuthenticated && user ? (
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username || 'user'}`
              }
              alt={user.name}
              className="w-5 h-5 rounded-full object-cover border border-indigo-500"
            />
          ) : isAuthenticated ? (
            <User className="w-5 h-5" />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          <span className="text-[10px] mt-1 leading-tight tracking-tight">
            {isAuthenticated ? 'Profile' : 'Log In'}
          </span>
        </Link>
      </div>
    </div>
  );
};
