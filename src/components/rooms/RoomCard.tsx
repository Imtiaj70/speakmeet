import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  Headphones,
  Lock,
  Crown,
  Sparkles,
  ArrowRight,
  Radio,
  Volume2,
  Users,
  Zap,
} from 'lucide-react';
import { SpeakingRoom } from '../../types';
import { getLanguageFlag, getLanguageName } from '../../data/languages';
import { isUserVip } from '../../config/vipStore';

interface RoomCardProps {
  room: SpeakingRoom;
  onJoin?: (roomId: string) => void;
}

// SpeakMate vibrant gradients for filled stage speakers
const POD_GRADIENTS = [
  'from-indigo-600 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
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
  const openSeatsCount = Math.max(0, maxCapacity - currentCount);
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
      className={`group relative rounded-2xl p-5.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
        isVipHost
          ? 'bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-950 border-2 border-amber-400 dark:border-amber-500/70 shadow-lg shadow-amber-500/10 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1'
          : 'bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-500/70 dark:hover:border-indigo-500/70 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/15 hover:-translate-y-1'
      }`}
    >
      {/* Top Atmospheric Aura - Glow on Card Hover */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/25 transition-all duration-500 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />

      <div>
        {/* Top Header: SpeakMate Custom Pill Badges + Live Status */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Language & Flag Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold tracking-tight shadow-2xs">
              <span className="text-sm leading-none">{flag || '🌐'}</span>
              <span>{getLanguageName(roomLang)}</span>
            </div>

            {/* Level Tag */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300">
              {room.englishLevel || 'All Levels'}
            </span>

            {isVipHost && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-xs">
                <Crown className="w-3 h-3 fill-slate-950 animate-bounce" />
                <span>Featured</span>
              </span>
            )}
          </div>

          {/* Room Live / Locked Status Badge with Enhanced Visuals */}
          <div className="shrink-0">
            {room.isLocked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-300/80 dark:border-amber-700/60 shadow-xs">
                <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Locked</span>
              </span>
            ) : isPrivate ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium">
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-300/80 dark:border-emerald-700/60 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-bold tracking-tight">Active Lounge</span>
              </span>
            )}
          </div>
        </div>

        {/* Room Title */}
        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1">
          {room.name}
        </h3>

        {/* Topic Subtitle */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0 group-hover:rotate-12 transition-transform" />
          <span className="truncate">
            {room.topicTitle || room.description || `Open conversational practice in ${roomLang}`}
          </span>
        </p>

        {/* ======================================================== */}
        {/* LIVE STAGE VISUALIZER (Interactive, pulsing & magnetic) */}
        {/* ======================================================== */}
        <div className="relative py-3 px-3 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-800/80 mb-4 transition-colors group-hover:border-indigo-300 dark:group-hover:border-indigo-800">
          {/* Header of Stage: Speaker Count & Live Voice Indicator */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2.5">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Headphones className="w-3.5 h-3.5 text-indigo-500" />
              <span>Voice Stage</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                Live
              </span>
            </span>

            {/* Speaking audio bars indicator */}
            <div className="flex items-center gap-2">
              <div className="flex items-end gap-0.5 h-3 px-1 py-0.5" title="Live Speaking Activity">
                <span className="w-0.5 bg-emerald-500 rounded-full animate-audio-bar-1 h-2" />
                <span className="w-0.5 bg-emerald-500 rounded-full animate-audio-bar-2 h-3" />
                <span className="w-0.5 bg-emerald-500 rounded-full animate-audio-bar-3 h-1.5" />
                <span className="w-0.5 bg-emerald-500 rounded-full animate-audio-bar-4 h-2.5" />
              </div>
              <span className="font-mono text-slate-600 dark:text-slate-300 font-bold text-xs">
                {currentCount}/{maxCapacity}
              </span>
            </div>
          </div>

          {/* Speakers & Interactive Seats */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {seats.map((seat) => {
              if (seat.isOccupied) {
                if (seat.isHost) {
                  // Host Speaker Pod with Speaking Waves & Halo
                  return (
                    <div key={`stage-seat-${seat.index}`} className="flex flex-col items-center gap-1">
                      <div className="relative">
                        {/* Live audio ping ring behind host */}
                        <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-live-ring pointer-events-none" />

                        {room.hostAvatar ? (
                          <img
                            src={room.hostAvatar}
                            alt={room.hostName}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-md transform group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-sm flex items-center justify-center ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-md transform group-hover:scale-105 transition-transform">
                            {hostInitials}
                          </div>
                        )}
                        {/* Host Badge */}
                        <span
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black shadow-xs border border-white dark:border-slate-900"
                          title="Room Host"
                        >
                          ★
                        </span>
                        {/* Speaking green beacon */}
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
                          <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[54px] text-center">
                        {room.hostName?.split(' ')[0] || 'Host'}
                      </span>
                    </div>
                  );
                }

                // Other Active Speakers with dynamic voice aura
                const gradient = POD_GRADIENTS[seat.index % POD_GRADIENTS.length];
                return (
                  <div key={`stage-seat-${seat.index}`} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <div
                        className={`w-11 h-11 rounded-full bg-gradient-to-tr ${gradient} text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-md animate-speaker-glow`}
                      >
                        <Mic className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      {/* Active green status dot */}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center">
                      Speaker {seat.index}
                    </span>
                  </div>
                );
              }

              // Available / Open Seat Pod with Magnetic "Take Mic" Ping
              return (
                <div key={`stage-seat-${seat.index}`} className="flex flex-col items-center gap-1">
                  <div className="relative group/seat">
                    <div className="w-11 h-11 rounded-full border-2 border-dashed border-indigo-400/50 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 transition-all hover:border-indigo-600 dark:hover:border-indigo-400 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 hover:scale-110 cursor-pointer animate-open-seat-call">
                      <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover/seat:animate-bounce" />
                    </div>
                    {/* Small pulsing invite beacon */}
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900 animate-ping" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    Open Mic
                  </span>
                </div>
              );
            })}
          </div>

          {/* Magnetic Urgency Callout for Open Seats */}
          {openSeatsCount > 0 && !isFull && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500 animate-pulse" />
                <span>{openSeatsCount} seat{openSeatsCount > 1 ? 's' : ''} available now!</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                Tap to Speak
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* IRRESISTIBLE HIGH-CONVERSION ACTION BUTTON WITH SHIMMER */}
      {/* ======================================================== */}
      <div className="pt-1">
        <Link to={`/rooms/${room.id}`} className="block w-full">
          <button
            type="button"
            disabled={isFull}
            onClick={() => onJoin?.(room.id)}
            className={`relative overflow-hidden w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isFull
                ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 border border-slate-200 dark:border-slate-700/50 cursor-not-allowed shadow-none'
                : room.isLocked
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98]'
            }`}
          >
            {/* Shimmer light sweep animation across button */}
            {!isFull && !room.isLocked && (
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 animate-shimmer pointer-events-none" />
            )}

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
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span className="tracking-wide">Enter Speaking Lounge</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </>
            )}
          </button>
        </Link>
      </div>
    </div>
  );
};
