import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  Headphones,
  Globe2,
  Lock,
  Crown,
  Sparkles,
  ArrowRight,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { SpeakingRoom } from '../../types';
import { getLanguageFlag, getLanguageName } from '../../data/languages';
import { isUserVip } from '../../config/vipStore';
import { VipBadge } from '../common/VipBadge';

interface RoomCardProps {
  room: SpeakingRoom;
  onJoin?: (roomId: string) => void;
}

// SpeakMate original stage colors for filled speaker pods
const POD_GRADIENTS = [
  'from-indigo-600 to-violet-600',
  'from-emerald-600 to-teal-600',
  'from-sky-600 to-blue-600',
  'from-rose-600 to-pink-600',
  'from-amber-600 to-orange-600',
];

function getInitials(name: string): string {
  if (!name) return 'SM';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin }) => {
  const currentCount =
    typeof room.participantCount === 'number'
      ? room.participantCount
      : typeof room.currentParticipants === 'number'
      ? room.currentParticipants
      : 1;

  const maxCapacity = Math.min(Math.max(room.maxParticipants || 5, 3), 6);
  const isFull = currentCount >= maxCapacity;
  const isPrivate = room.visibility === 'private' || room.isPrivate;
  const roomLang = room.language || room.conversationLanguage || 'English';
  const flag = getLanguageFlag(roomLang);
  const isVipHost = isUserVip(room.hostId) || isUserVip(room.hostName) || (room as any).isFeatured;

  // SpeakMate Stage Seats Array
  const seats = Array.from({ length: maxCapacity }).map((_, index) => {
    const isOccupied = index < currentCount;
    return {
      index,
      isOccupied,
      isHost: index === 0,
    };
  });

  const hostInitials = getInitials(room.hostName || 'Host');

  return (
    <div
      className={`group relative rounded-2xl p-5.5 transition-all duration-300 flex flex-col justify-between ${
        isVipHost
          ? 'bg-gradient-to-b from-amber-50/70 via-white to-amber-50/20 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-950 border-2 border-amber-400 dark:border-amber-500/70 shadow-lg shadow-amber-500/5 hover:border-amber-500 hover:shadow-xl'
          : 'bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5'
      }`}
    >
      <div>
        {/* Top Header: SpeakMate Custom Pill Badges */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Language & Flag Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold tracking-tight">
              <span className="text-sm leading-none">{flag || '🌐'}</span>
              <span>{getLanguageName(roomLang)}</span>
            </div>

            {/* Level Tag with SpeakMate Accent Colors */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300">
              {room.englishLevel || 'All Levels'}
            </span>

            {isVipHost && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-xs">
                <Crown className="w-3 h-3 fill-slate-950" />
                <span>Featured</span>
              </span>
            )}
          </div>

          {/* Room Live / Locked Status Badge */}
          <div className="shrink-0">
            {room.isLocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-300/80 dark:border-amber-700/60 shadow-xs">
                <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Locked</span>
              </span>
            ) : isPrivate ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium">
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/70 dark:border-emerald-800/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Active Lounge</span>
              </span>
            )}
          </div>
        </div>

        {/* Room Title */}
        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">
          {room.name}
        </h3>

        {/* Topic Subtitle */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-4 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span className="truncate">
            {room.topicTitle || room.description || `Open conversational practice in ${roomLang}`}
          </span>
        </p>

        {/* ======================================================== */}
        {/* SPEAKMATE ORIGINAL "STAGE PODS" (Clean, distinctive visual seats) */}
        {/* ======================================================== */}
        <div className="py-2.5 px-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/70 mb-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-2.5">
            <span className="flex items-center gap-1">
              <Headphones className="w-3 h-3 text-indigo-500" />
              <span>Voice Stage</span>
            </span>
            <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">
              {currentCount} / {maxCapacity} speakers
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {seats.map((seat) => {
              if (seat.isOccupied) {
                if (seat.isHost) {
                  // Host Speaker Pod
                  return (
                    <div key={`stage-seat-${seat.index}`} className="flex flex-col items-center gap-1">
                      <div className="relative">
                        {room.hostAvatar ? (
                          <img
                            src={room.hostAvatar}
                            alt={room.hostName}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/80 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-sm"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-sm flex items-center justify-center ring-2 ring-indigo-500/80 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-sm">
                            {hostInitials}
                          </div>
                        )}
                        <span
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-bold shadow-xs border border-white dark:border-slate-900"
                          title="Room Host"
                        >
                          ★
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[54px] text-center">
                        {room.hostName?.split(' ')[0] || 'Host'}
                      </span>
                    </div>
                  );
                }

                // Other Active Speakers
                const gradient = POD_GRADIENTS[seat.index % POD_GRADIENTS.length];
                return (
                  <div key={`stage-seat-${seat.index}`} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <div
                        className={`w-11 h-11 rounded-full bg-gradient-to-tr ${gradient} text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-sm`}
                      >
                        <Mic className="w-4 h-4 text-white" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 text-center">
                      Speaker
                    </span>
                  </div>
                );
              }

              // Available / Open Seat Pod
              return (
                <div key={`stage-seat-${seat.index}`} className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center text-slate-400 dark:text-slate-600 transition-all hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-500 hover:scale-105">
                    <Mic className="w-3.5 h-3.5 opacity-40" />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Open
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SPEAKMATE SIGNATURE ACTION BUTTON */}
      {/* ======================================================== */}
      <div className="pt-2">
        <Link to={`/rooms/${room.id}`} className="block w-full">
          <button
            type="button"
            disabled={isFull}
            onClick={() => onJoin?.(room.id)}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              isFull
                ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 border border-slate-200 dark:border-slate-700/50 cursor-not-allowed'
                : room.isLocked
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-500/20 active:scale-[0.99]'
            }`}
          >
            {room.isLocked ? (
              <>
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Room is Locked</span>
              </>
            ) : isFull ? (
              <>
                <span>Room is Full ({maxCapacity}/{maxCapacity})</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Enter Speaking Lounge</span>
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </Link>
      </div>
    </div>
  );
};
